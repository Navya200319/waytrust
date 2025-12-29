
export enum TransportMode {
  CAR = 'Car',
  BUS = 'Bus',
  TRAIN = 'Train',
  FLIGHT = 'Flight'
}

export type DestinationCategory = 'Beach' | 'Hill Station' | 'Heritage' | 'Spiritual' | 'Adventure' | 'City Break' | 'Any';

export interface TripInputs {
  budget: string;
  duration: string;
  persons: string;
  location: string;
  departureDate: string;
  transport: TransportMode;
  destinationType: DestinationCategory;
  targetDestination: string;
  foodPreference: string;
  mood: string;
  villageFriendlyMode: boolean;
}

export type Language = 'en' | 'hi' | 'te' | 'ta' | 'bn';

export interface ItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
  estimatedCost: number;
  theme: string;
  foodHighlight: string;
}

export interface TravelMood {
  id: string;
  label: string;
  icon: string;
}

export interface WeatherInfo {
  temperature: string;
  condition: string;
  suggestion: string;
}

export interface Attraction {
  name: string;
  description: string;
  searchQuery: string;
}

export interface Accommodation {
  name: string;
  type: string;
  pricePerNight: number;
  contactInfo: string;
  description: string;
}

export interface TransportOption {
  name: string;
  details: string;
  schedule: string;
  priceEst: string;
  type: 'Train' | 'Flight' | 'Bus' | 'Car';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface EmergencyContact {
  category: string;
  name: string;
  contact: string;
}

export interface LocalPhrase {
  english: string;
  local: string;
  phonetic: string;
}

export interface FoodRecommendation {
  dish: string;
  placeType: string;
  priceRange: string;
}

export interface MapInstruction {
  instruction: string;
  landmark: string;
}

export interface VillageDetails {
  stepByStepPath: string[];
  transportSequence: string;
  nearestStation: string;
  localTimings: string;
  practicalNotes: string[];
}

export interface DestinationIntelligence {
  bestTimeToVisit: string;
  networkAvailability: string;
  difficultyLevel: {
    label: 'Easy' | 'Moderate' | 'Hard';
    explanation: string;
  };
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  mostForgottenItems: string[];
}

export interface GeneratedPlan {
  id: string; 
  timestamp: number;
  destination: string;
  totalEstimatedCost: number;
  itinerary: ItineraryDay[];
  travelTips: string[];
  viabilityMessage: string;
  weather: WeatherInfo;
  sources: GroundingSource[];
  sightseeing: Attraction[];
  accommodations: Accommodation[];
  transportOptions: TransportOption[];
  transitSummary: string;
  ecoImpact: string;
  localCulture: string;
  foodSpecialties: string[];
  culinaryStrategy: string;
  inputs?: TripInputs;
  // Offline Pack Data
  emergencyContacts: EmergencyContact[];
  localPhrases: LocalPhrase[];
  offlineFoodRecommendations: FoodRecommendation[];
  mapGuide: MapInstruction[];
  // Village Mode Data
  villageDetails?: VillageDetails;
  // Intelligence Profile
  intelligence?: DestinationIntelligence;
}

export interface BookedAccommodation extends Accommodation {
  id: string;
  bookingDate: number;
  destination: string;
}

export interface User {
  fullName: string;
  email: string;
  phone: string;
  savedTrips?: GeneratedPlan[];
  bookedAccommodations?: BookedAccommodation[];
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  baseCost: number;
  type: 'Beach' | 'Hill Station' | 'Heritage' | 'Spiritual' | 'Adventure' | 'City Break';
  tags: string[];
}

export interface BudgetBreakdown {
  transport: number;
  stay: number;
  food: number;
  activities: number;
}
