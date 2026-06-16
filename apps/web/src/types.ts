export type Strategy = 'value' | 'comfort' | 'budget'
export interface Attraction { id: number; name: string; description: string; tag: string }
export interface Destination { id: number; name: string; province: string; cover: string; cardCover?: string; slogan: string; reason: string; bestMonths: number[]; days: number; budgetMin: number; budgetMax: number; styles: string[]; score: number; features: string[]; route: string[]; tips: string[]; attractions: Attraction[] }
export interface SearchInput { origin: string; destination: string; departureDate: string; returnDate?: string; travelers: number; budget?: number }
export interface TransportOption { id: string; mode: string; title: string; departure: string; arrival: string; durationMinutes: number; transfers: number; price: number; comfort: number; detail: string; updatedAt: string; bookingUrl: string; source: string; referenceOnly: boolean; scores: Record<Strategy, number> }
export interface Favorite { id: number; destination: Destination; transport?: TransportOption; search?: SearchInput; createdAt: string }
