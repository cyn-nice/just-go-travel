import { createHash, randomInt } from 'node:crypto'
import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { IsMobilePhone, IsString, Length } from 'class-validator'
import { sms } from 'tencentcloud-sdk-nodejs-sms'

export class PhoneDto { @IsMobilePhone('zh-CN') phone!: string }
export class LoginDto extends PhoneDto { @IsString() @Length(6, 6) code!: string }

interface VerificationCode {
  digest: string
  expiresAt: number
  sentAt: number
  attempts: number
}

@Injectable()
export class SmsService {
  private readonly codes = new Map<string, VerificationCode>()
  private readonly expiresInSeconds = 300
  private readonly resendAfterSeconds = 60

  private isProductionSms() {
    return process.env.SMS_PROVIDER === 'tencent'
  }

  private digest(phone: string, code: string) {
    const secret = process.env.SMS_CODE_SECRET || process.env.JWT_SECRET || 'local-dev-secret'
    return createHash('sha256').update(`${phone}:${code}:${secret}`).digest('hex')
  }

  private assertTencentConfig() {
    const required = [
      'TENCENTCLOUD_SECRET_ID',
      'TENCENTCLOUD_SECRET_KEY',
      'TENCENT_SMS_SDK_APP_ID',
      'TENCENT_SMS_SIGN_NAME',
      'TENCENT_SMS_TEMPLATE_ID',
    ]
    const missing = required.filter(key => !process.env[key])
    if (missing.length) {
      throw new InternalServerErrorException(`短信服务缺少配置：${missing.join(', ')}`)
    }
  }

  private async sendTencent(phone: string, code: string) {
    this.assertTencentConfig()
    const Client = sms.v20210111.Client
    const client = new Client({
      credential: {
        secretId: process.env.TENCENTCLOUD_SECRET_ID!,
        secretKey: process.env.TENCENTCLOUD_SECRET_KEY!,
      },
      region: process.env.TENCENTCLOUD_REGION || 'ap-guangzhou',
      profile: { httpProfile: { reqMethod: 'POST', reqTimeout: 8 } },
    })
    const response = await client.SendSms({
      PhoneNumberSet: [`+86${phone}`],
      SmsSdkAppId: process.env.TENCENT_SMS_SDK_APP_ID!,
      SignName: process.env.TENCENT_SMS_SIGN_NAME!,
      TemplateId: process.env.TENCENT_SMS_TEMPLATE_ID!,
      TemplateParamSet: [code, String(Math.ceil(this.expiresInSeconds / 60))],
    })
    const status = response.SendStatusSet?.[0]
    if (!status || status.Code !== 'Ok') {
      throw new InternalServerErrorException(status?.Message || '短信发送失败')
    }
  }

  async send(phone: string) {
    const now = Date.now()
    const existing = this.codes.get(phone)
    if (existing && now - existing.sentAt < this.resendAfterSeconds * 1000) {
      const retryAfter = Math.ceil((this.resendAfterSeconds * 1000 - (now - existing.sentAt)) / 1000)
      throw new HttpException(`请在 ${retryAfter} 秒后重试`, HttpStatus.TOO_MANY_REQUESTS)
    }

    const code = this.isProductionSms()
      ? String(randomInt(0, 1_000_000)).padStart(6, '0')
      : (process.env.DEV_SMS_CODE || '123456')

    if (this.isProductionSms()) await this.sendTencent(phone, code)

    this.codes.set(phone, {
      digest: this.digest(phone, code),
      expiresAt: now + this.expiresInSeconds * 1000,
      sentAt: now,
      attempts: 0,
    })

    return {
      success: true,
      expiresIn: this.expiresInSeconds,
      resendAfter: this.resendAfterSeconds,
      provider: this.isProductionSms() ? 'tencent' : 'development',
      devCode: this.isProductionSms() || (process.env.NODE_ENV === 'production' && process.env.EXPOSE_DEV_SMS_CODE !== 'true') ? undefined : code,
    }
  }

  verify(phone: string, code: string) {
    const record = this.codes.get(phone)
    if (!record || record.expiresAt <= Date.now()) {
      this.codes.delete(phone)
      throw new UnauthorizedException('验证码已失效，请重新获取')
    }
    if (record.attempts >= 5) {
      this.codes.delete(phone)
      throw new UnauthorizedException('验证次数过多，请重新获取验证码')
    }
    if (record.digest !== this.digest(phone, code)) {
      record.attempts += 1
      throw new UnauthorizedException('验证码错误')
    }
    this.codes.delete(phone)
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    try { req.user = this.jwt.verify(token); return true } catch { throw new UnauthorizedException('请先登录') }
  }
}

@Controller('auth/sms')
export class AuthController {
  constructor(private jwt: JwtService, private smsService: SmsService) {}

  @Post('send')
  send(@Body() body: PhoneDto) {
    return this.smsService.send(body.phone)
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    this.smsService.verify(body.phone, body.code)
    const user = { id: Number(body.phone), phone: body.phone }
    return { token: this.jwt.sign(user), user }
  }
}
