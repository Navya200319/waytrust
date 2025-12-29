
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { TransportMode, TripInputs, BudgetBreakdown, DestinationCategory, User, Destination, GeneratedPlan, Attraction, ItineraryDay, WeatherInfo, Accommodation, TransportOption, GroundingSource, BookedAccommodation, EmergencyContact, LocalPhrase, FoodRecommendation, MapInstruction, VillageDetails, DestinationIntelligence } from '../types';
import { DESTINATIONS, COLORS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GoogleGenAI, Type } from '@google/genai';
import { useLanguage } from '../contexts/LanguageContext';

interface CustomizationProps {
  user: User | null;
  onUpdateUser: (u: User) => void;
}

const debounce = (func: Function, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const Customization: React.FC<CustomizationProps> = ({ user, onUpdateUser }) => {
  const [searchParams] = useSearchParams();
  const prefillDestName = searchParams.get('to');
  const prefillDate = searchParams.get('date');
  const hasAutoRun = useRef(false);
  const { language, t } = useLanguage();

  if (!user) {
    const toParam = prefillDestName ? `&to=${prefillDestName}` : '';
    const dateParam = prefillDate ? `&date=${prefillDate}` : '';
    return <Navigate to={`/login?redirect=customize${toParam}${dateParam}`} replace />;
  }

  const [inputs, setInputs] = useState<TripInputs>({
    budget: '25000',
    duration: '4',
    persons: '2',
    location: '',
    departureDate: prefillDate || new Date().toISOString().split('T')[0],
    transport: TransportMode.TRAIN,
    destinationType: 'Any',
    targetDestination: prefillDestName || '',
    foodPreference: 'Flexible',
    mood: 'Exploratory',
    villageFriendlyMode: false
  });

  const [breakdown, setBreakdown] = useState<BudgetBreakdown>({
    transport: 0,
    stay: 0,
    food: 0,
    activities: 0
  });

  const [viability, setViability] = useState<{ score: string; color: string }>({
    score: 'Awaiting Input',
    color: '#475569'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPack, setIsDownloadingPack] = useState(false);
  
  const [selectedPlace, setSelectedPlace] = useState<Attraction | null>(null);
  const [placeImageUrl, setPlaceImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [locationSuggestions, setLocationSuggestions] = useState<{ name: string; description?: string }[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoadingLocationSuggestions, setIsLoadingLocationSuggestions] = useState(false);

  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);

  const [activeSection, setActiveSection] = useState<string | null>(null);

  const destinationCategories: DestinationCategory[] = ['Beach', 'Hill Station', 'Heritage', 'Spiritual', 'Adventure', 'City Break', 'Any'];

  const [tradeOffs, setTradeOffs] = useState({
    comfort: 50,
    pacing: 50
  });

  const confidenceData = useMemo(() => {
    if (!generatedPlan) return null;

    const weatherLower = generatedPlan.weather.condition.toLowerCase();
    let weatherScore = 70;
    if (weatherLower.includes('clear') || weatherLower.includes('sunny') || weatherLower.includes('pleasant')) weatherScore = 100;
    else if (weatherLower.includes('rain') || weatherLower.includes('monsoon')) weatherScore = 50;
    else if (weatherLower.includes('storm') || weatherLower.includes('extreme')) weatherScore = 30;

    const userBudget = Number(inputs.budget) || 0;
    const estimatedCost = generatedPlan.totalEstimatedCost;
    let budgetScore = 0;
    if (userBudget >= estimatedCost) budgetScore = 100;
    else {
      const ratio = userBudget / estimatedCost;
      budgetScore = Math.max(0, ratio * 100);
    }

    const month = new Date(inputs.departureDate).getMonth();
    const isPeak = month >= 10 || month <= 1;
    const crowdScore = isPeak ? 65 : 90;

    let timeScore = 80;
    if (inputs.transport === TransportMode.FLIGHT) timeScore = 100;
    else if (inputs.transport === TransportMode.TRAIN) timeScore = 85;
    else timeScore = 70;

    const finalScore = Math.round(
      (weatherScore * 0.3) + 
      (budgetScore * 0.3) + 
      (crowdScore * 0.2) + 
      (timeScore * 0.2)
    );

    return {
      total: finalScore,
      factors: [
        { label: 'Weather Suitability', status: weatherScore > 70 ? 'Optimal' : weatherScore > 40 ? 'Fair' : 'Poor', icon: 'fa-cloud-sun' },
        { label: 'Budget Calibration', status: budgetScore > 90 ? 'Strong' : budgetScore > 60 ? 'Moderate' : 'Tight', icon: 'fa-wallet' },
        { label: 'Projected Density', status: crowdScore > 80 ? 'Low' : 'Moderate', icon: 'fa-users' },
        { label: 'Transit Efficiency', status: timeScore > 80 ? 'Comfortable' : 'Standard', icon: 'fa-clock' }
      ]
    };
  }, [generatedPlan, inputs.budget, inputs.departureDate, inputs.transport]);

  const tradeOffFeedback = useMemo(() => {
    if (!generatedPlan) return null;

    const costDelta = Math.round((tradeOffs.comfort - 50) * 100); 
    const timeDelta = ((tradeOffs.pacing - 50) / 10).toFixed(1);

    const costText = costDelta > 0 
      ? `Saving ₹${Math.abs(costDelta).toLocaleString()}` 
      : `Adding ₹${Math.abs(costDelta).toLocaleString()} for luxury`;
    
    const timeText = Number(timeDelta) > 0 
      ? `adds ${Math.abs(Number(timeDelta))} travel hours` 
      : `saves ${Math.abs(Number(timeDelta))} hours via direct transit`;

    const flavorText = tradeOffs.pacing > 50 
      ? "but increases scenic immersion" 
      : "with optimized neural routing";

    return `${costText} ${timeText} ${flavorText}.`;
  }, [tradeOffs, generatedPlan]);

  const recommendedDestinations = useMemo(() => {
    if (inputs.destinationType === 'Any') return DESTINATIONS;
    return DESTINATIONS.filter(d => d.type === inputs.destinationType);
  }, [inputs.destinationType]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const fetchLocationSuggestions = useCallback(debounce(async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setIsLoadingLocationSuggestions(false);
      return;
    }
    setIsLoadingLocationSuggestions(true);
    setShowLocationSuggestions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: `List 5 popular travel locations in India matching "${query}". Return as JSON array of objects with 'name' and 'description'. Respond in ${language}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['name', 'description'],
            },
          },
        },
      });
      const jsonText = response.text?.trim();
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        setLocationSuggestions(parsed);
      }
    } catch (error) {
      console.error("Location Fetch Error:", error);
    } finally {
      setIsLoadingLocationSuggestions(false);
    }
  }, 400), [language]);

  const handleGetCurrentLocation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Reverse geocode ${latitude}, ${longitude} to a city in India.`,
            config: { systemInstruction: "Respond with 'City, State' only." },
          });
          const cityName = response.text?.trim() || 'Detected Location';
          setInputs((prev: TripInputs) => ({ ...prev, location: cityName }));
          setShowLocationSuggestions(false);
        } catch (error) {
          setInputs((prev: TripInputs) => ({ ...prev, location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` }));
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false)
    );
  };

  const generatePlanAction = async (currentInputs: TripInputs) => {
    setIsGenerating(true);
    setGeneratedPlan(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const target = currentInputs.targetDestination || `a ${currentInputs.destinationType} destination`;

      const prompt = `Act as a WayTrust Smart Travel Agent. 
        Mission: Synthesize a ${currentInputs.duration}-day trip starting on ${currentInputs.departureDate} from ${currentInputs.location} to ${target} for ${currentInputs.persons} people.
        Mood: ${currentInputs.mood}. Adjust pace and activities to reflect this mood.
        Budget: ₹${currentInputs.budget}. Transport Mode: ${currentInputs.transport}.
        Essence: ${currentInputs.destinationType}.
        Language: All output in ${language}.
        
        CRITICAL: Provide accommodation and transportation options that are strictly specific and likely available for the chosen start date: ${currentInputs.departureDate}.
        
        INTELLIGENCE PROFILE ROLE:
        Generate destination-specific information for ${target} in India.
        1. BEST TIME TO VISIT: month-wise guidance using labels [Best, Okay, Avoid] with brief factors.
        2. NETWORK AVAILABILITY: [Good, Average, Poor], mention Indian providers and internet reliability.
        3. DIFFICULTY LEVEL: Choose exactly one from [Easy, Moderate, Hard] with one short explanatory line.
        4. PROS & CONS: Exactly 3 Pros and 3 Cons, short and practical.
        5. MOST FORGOTTEN ITEMS: Exactly 5 items relevant to ${target} for Indian travelers.

        VILLAGE-FRIENDLY MODE IS ${currentInputs.villageFriendlyMode ? 'ENABLED' : 'DISABLED'}.
        ${currentInputs.villageFriendlyMode ? `
        VILLAGE LOGIC REQUIREMENTS:
        1. Assume limited transport from ${currentInputs.location}.
        2. Plan realistic routes: Walk -> Shared Auto -> Local Bus -> Train.
        3. Identify the nearest railway station to ${currentInputs.location} and distance.
        4. Use local timings: Morning buses start 6:00-7:00 AM; evening transport ends early.
        5. Add 45-60 min buffer time between rural segments.
        6. Avoid "Google-ideal" direct routes; stick to high-frequency village routes.
        ` : ''}

        REQUIRED JSON STRUCTURE (Use \`\`\`json tags):
        {
          "destination": "Specific City Name",
          "totalEstimatedCost": number,
          "transitSummary": "Overview of travel logistics",
          "transportOptions": [{"name": "Specific Train/Flight/Bus", "details": "Carrier details", "schedule": "Specific timing for ${currentInputs.departureDate}", "priceEst": "₹Cost"}],
          "weather": {"temperature": "string", "condition": "string", "suggestion": "Travel clothing/activity logic for the season of ${currentInputs.departureDate}"},
          "accommodations": [{"name": "Hotel Name", "type": "Luxury/Mid-range/Budget", "pricePerNight": number, "contactInfo": "URL or Phone", "description": "Availability note for ${currentInputs.departureDate}"}],
          "itinerary": [{"day": number, "theme": string, "morning": string, "afternoon": string, "evening": string, "estimatedCost": number, "foodHighlight": string}],
          "sightseeing": [{"name": "Landmark Name", "description": "Bio", "searchQuery": "string"}],
          "localCulture": "Detailed description of local heritage, traditions, and culture",
          "foodSpecialties": ["Dish 1", "Dish 2", "Dish 3"],
          "culinaryStrategy": "Brief gastronomy overview based on ${currentInputs.foodPreference}",
          "travelTips": ["string"],
          "emergencyContacts": [{"category": "string", "name": "string", "contact": "string"}],
          "localPhrases": [{"english": "string", "local": "string", "phonetic": "string"}],
          "offlineFoodRecommendations": [{"dish": "string", "placeType": "string", "priceRange": "string"}],
          "mapGuide": [{"instruction": "string", "landmark": "string"}],
          "villageDetails": {
             "stepByStepPath": ["string"],
             "transportSequence": "string",
             "nearestStation": "string",
             "localTimings": "string",
             "practicalNotes": ["string"]
          },
          "intelligence": {
            "bestTimeToVisit": "string (plain text guidance)",
            "networkAvailability": "string (plain text guidance)",
            "difficultyLevel": { "label": "Easy/Moderate/Hard", "explanation": "string" },
            "prosAndCons": { "pros": ["string"], "cons": ["string"] },
            "mostForgottenItems": ["string"]
          }
        }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: prompt,
        config: {
          tools: [{ googleMaps: {}, googleSearch: {} }],
          toolConfig: userCoords ? {
            retrievalConfig: { latLng: { latitude: userCoords.lat, longitude: userCoords.lng } }
          } : undefined
        }
      });

      const text = response.text || "";
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        const planData = JSON.parse(jsonMatch[1]);
        const sources: GroundingSource[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          chunks.forEach((chunk: any) => {
            if (chunk.maps) sources.push({ title: chunk.maps.title || 'Maps', uri: chunk.maps.uri });
            else if (chunk.web) sources.push({ title: chunk.web.title || 'Source', uri: chunk.web.uri });
          });
        }
        setGeneratedPlan({ 
          ...planData, 
          sources, 
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          inputs: { ...currentInputs } 
        });
      } else {
        throw new Error("Neural synthesis failed to parse.");
      }
    } catch (error) {
      console.error(error);
      alert("Neural sync error. Retrying mission...");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = () => {
    if (!generatedPlan || !user) return;
    setIsSaving(true);
    
    const currentSaved = user.savedTrips || [];
    const isAlreadySaved = currentSaved.some(t => t.id === generatedPlan.id);
    
    if (!isAlreadySaved) {
      const updatedUser = {
        ...user,
        savedTrips: [generatedPlan, ...currentSaved]
      };
      onUpdateUser(updatedUser);
    }
    
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleBookAccommodation = (accommodation: Accommodation) => {
    if (!user || !generatedPlan) return;
    
    const newBooking: BookedAccommodation = {
      ...accommodation,
      id: Math.random().toString(36).substr(2, 9),
      bookingDate: Date.now(),
      destination: generatedPlan.destination
    };

    const currentBookings = user.bookedAccommodations || [];
    const updatedUser = {
      ...user,
      bookedAccommodations: [newBooking, ...currentBookings]
    };
    
    // Also save the trip plan if not saved yet
    const currentSavedPlans = user.savedTrips || [];
    if (!currentSavedPlans.some(p => p.id === generatedPlan.id)) {
      updatedUser.savedTrips = [generatedPlan, ...currentSavedPlans];
    }

    onUpdateUser(updatedUser);
    alert(`${accommodation.name} has been added to your booked accommodations! Check your profile.`);
  };

  const handleDownloadAndSave = () => {
    if (!generatedPlan || !user) return;
    setIsDownloading(true);
    
    handleSaveTrip();

    const dataStr = JSON.stringify(generatedPlan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `WayTrust_${generatedPlan.destination}_Plan.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const handleDownloadOfflinePack = () => {
    if (!generatedPlan || !user) return;
    setIsDownloadingPack(true);
    
    // Format a Survival Guide Text File
    let content = `WAYTRUST TACTICAL TRAVEL PACK: ${generatedPlan.destination.toUpperCase()}\n`;
    content += `========================================================\n\n`;
    content += `MISSION OVERVIEW:\n`;
    content += `Start Date: ${generatedPlan.inputs?.departureDate}\n`;
    content += `Duration: ${generatedPlan.itinerary.length} Days\n`;
    content += `Total Est. Budget: ₹${generatedPlan.totalEstimatedCost.toLocaleString()}\n\n`;
    
    if (generatedPlan.villageDetails) {
       content += `VILLAGE-FRIENDLY TACTICAL ROUTE:\n`;
       content += `Sequence: ${generatedPlan.villageDetails.transportSequence}\n`;
       content += `Nearest Station: ${generatedPlan.villageDetails.nearestStation}\n`;
       content += `Timings: ${generatedPlan.villageDetails.localTimings}\n`;
       content += `Path:\n`;
       generatedPlan.villageDetails.stepByStepPath.forEach((s, i) => content += `  ${i+1}. ${s}\n`);
       content += `Notes:\n`;
       generatedPlan.villageDetails.practicalNotes.forEach(n => content += `  * ${n}\n`);
       content += `\n`;
    }

    content += `EMERGENCY NODES:\n`;
    generatedPlan.emergencyContacts.forEach(c => {
      content += `- ${c.category}: ${c.name} (${c.contact})\n`;
    });
    content += `\n`;
    
    content += `LOCAL PHRASES:\n`;
    generatedPlan.localPhrases.forEach(p => {
      content += `- "${p.english}": ${p.local} (Phonetic: ${p.phonetic})\n`;
    });
    content += `\n`;

    content += `OFFLINE NAVIGATION (LANDMARKS):\n`;
    generatedPlan.mapGuide.forEach((m, i) => {
      content += `${i + 1}. ${m.instruction} (Landmark: ${m.landmark})\n`;
    });
    content += `\n`;

    content += `BUDGET DINING (OFFLINE READY):\n`;
    generatedPlan.offlineFoodRecommendations.forEach(f => {
      content += `- ${f.dish} at ${f.placeType} (~${f.priceRange})\n`;
    });
    content += `\n`;

    content += `DETAILED ITINERARY:\n`;
    generatedPlan.itinerary.forEach(day => {
      content += `Day ${day.day}: ${day.theme}\n`;
      content += `  Morning: ${day.morning}\n`;
      content += `  Afternoon: ${day.afternoon}\n`;
      content += `  Evening: ${day.evening}\n`;
      content += `  Meal Focus: ${day.foodHighlight}\n\n`;
    });

    content += `========================================================\n`;
    content += `END OF OFFLINE PACK - SAFE TRAVELS\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WayTrust_Offline_Pack_${generatedPlan.destination}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    // Save to profile as well
    handleSaveTrip();
    
    setTimeout(() => setIsDownloadingPack(false), 800);
  };

  const isTripSaved = useMemo(() => {
    if (!generatedPlan || !user?.savedTrips) return false;
    return user.savedTrips.some(t => t.id === generatedPlan.id);
  }, [generatedPlan, user]);

  const handleVisualiseLandmark = async (attraction: Attraction | Destination) => {
    setSelectedPlace({
      name: attraction.name,
      description: attraction.description,
      searchQuery: attraction.name
    });
    setPlaceImageUrl(null);
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = 'image' in attraction 
        ? `A cinematic high-fidelity landscape photograph of ${attraction.name}, India. Professional travel photography showcasing iconic views.`
        : `A cinematic high-fidelity photograph of ${attraction.name} in its local setting. Professional travel photography.`;

      const imgRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] }
      });
      const part = imgRes.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) setPlaceImageUrl(`data:image/png;base64,${part.inlineData.data}`);
    } catch (e) { console.error(e); } finally { setIsGeneratingImage(false); }
  };

  useEffect(() => {
    if (prefillDestName && !hasAutoRun.current) {
      const dest = DESTINATIONS.find(d => d.name.toLowerCase() === prefillDestName.toLowerCase());
      if (dest) {
        const updated: TripInputs = {
          ...inputs,
          targetDestination: dest.name,
          destinationType: dest.type as DestinationCategory,
          duration: '4', persons: '2', budget: (dest.baseCost * 2.5).toString(),
          transport: TransportMode.TRAIN, location: 'New Delhi',
          departureDate: prefillDate || new Date().toISOString().split('T')[0]
        };
        setInputs(updated);
        hasAutoRun.current = true;
        generatePlanAction(updated);
      }
    }
  }, [prefillDestName]);

  useEffect(() => {
    const { budget, duration, persons, transport } = inputs;
    if (!budget || !duration || !persons || !transport) return;
    const tWeight: any = { [TransportMode.FLIGHT]: 0.3, [TransportMode.TRAIN]: 0.15, [TransportMode.BUS]: 0.1, [TransportMode.CAR]: 0.2 };
    const tCost = Number(budget) * (tWeight[transport] || 0.1);
    const rest = Number(budget) - tCost;
    setBreakdown({ transport: tCost, stay: rest * 0.45, food: rest * 0.3, activities: rest * 0.25 });
    const cppd = Number(budget) / (Number(persons) * Number(duration));
    if (cppd > 8000) setViability({ score: 'Excellent', color: COLORS.green });
    else if (cppd < 2500) setViability({ score: 'Tight', color: COLORS.red });
    else setViability({ score: 'Manageable', color: COLORS.yellow });
  }, [inputs]);

  const getDirectionsUrl = () => {
    if (!generatedPlan || !generatedPlan.sightseeing.length) return '#';
    const s = generatedPlan.sightseeing;
    const origin = encodeURIComponent(s[0].name);
    const destination = encodeURIComponent(s[s.length - 1].name);
    const waypoints = s.length > 2 ? s.slice(1, -1).map(p => encodeURIComponent(p.name)).join('/') : '';
    return waypoints ? `https://www.google.com/maps/dir/${origin}/${waypoints}/${destination}` : `https://www.google.com/maps/dir/${origin}/${destination}`;
  };

  const chartData = useMemo(() => [
    { name: 'Transport', value: breakdown.transport, color: COLORS.cyan },
    { name: 'Stay', value: breakdown.stay, color: COLORS.purple },
    { name: 'Food', value: breakdown.food, color: COLORS.blue },
    { name: 'Activities', value: breakdown.activities, color: '#facc15' }
  ], [breakdown]);

  const packingChecklist = useMemo(() => {
    if (!generatedPlan) return null;
    const climate = generatedPlan.weather.condition.toLowerCase();
    const duration = parseInt(inputs.duration);
    const isCold = climate.includes('cold') || climate.includes('snow') || climate.includes('winter') || inputs.destinationType === 'Hill Station';
    const isWarm = climate.includes('warm') || climate.includes('beach') || climate.includes('sunny') || inputs.destinationType === 'Beach';
    const isRainy = climate.includes('rain') || climate.includes('monsoon');

    const clothes = [];
    if (isCold) clothes.push('Heavy woolens & thermal innerwear', 'Down jacket & waterproof gloves', 'Woolen socks & beanie');
    else if (isWarm) clothes.push('Light cotton breathable fabrics', 'Swimwear & flip-flops', 'Sun hat & linen shirts');
    else clothes.push('Comfortable layers (shirts, jackets)', 'Denim or versatile trousers');
    
    if (isRainy) clothes.push('Lightweight raincoat or poncho', 'Water-resistant footwear');
    
    clothes.push(`${Math.ceil(duration * 1.2)} pairs of socks/undergarments`, 'Walking shoes for exploration');

    const medicines = ['Personal prescription medications', 'Basic first-aid kit (bandages, antiseptic)', 'Painkillers & antacids', 'ORS packets for hydration'];
    if (isWarm) medicines.push('Sunscreen (SPF 50+) & Aloe Vera gel');
    if (isCold) medicines.push('Cold & cough relief tablets', 'Lip balm & moisturizer');

    const essentials = ['Universal travel adapter', 'Power bank (10000mAh+)', 'Original IDs & digital copies', 'Reusable water bottle'];
    if (Number(inputs.persons) > 1) essentials.push('Shared travel documents folder');
    if (inputs.destinationType === 'Adventure') essentials.push('Compact flashlight or headlamp', 'Daypack for treks');

    return { clothes, medicines, essentials };
  }, [generatedPlan, inputs]);

  const RecommendationsGrid = ({ title }: { title: string }) => (
    <div className="space-y-6 pt-12 border-t border-white/5">
      <div className="flex items-center justify-between">
         <h3 className="text-2xl font-black font-orbitron uppercase tracking-widest text-white">{title}</h3>
         <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">Essence: {inputs.destinationType}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedDestinations.length > 0 ? (
          recommendedDestinations.map(dest => (
            <div 
              key={dest.id} 
              className={`group relative glass rounded-3xl overflow-hidden border transition-all ${
                inputs.targetDestination === dest.name 
                  ? 'neon-border scale-[1.02] shadow-[0_0_20px_rgba(0,243,255,0.2)]' 
                  : 'border-white/10 hover:border-cyan-400/40'
              }`}
            >
              <div className="h-40 overflow-hidden relative cursor-pointer" onClick={() => handleVisualiseLandmark(dest)}>
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                <div className="absolute top-3 right-3 z-20">
                  <div className="w-8 h-8 glass rounded-full flex items-center justify-center text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400 hover:text-slate-950 transition-all shadow-lg">
                    <i className="fas fa-eye text-[10px]"></i>
                  </div>
                </div>
                <div className="absolute bottom-3 left-4">
                  <h4 className="text-xl font-black font-orbitron text-white uppercase">{dest.name}</h4>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{dest.description}</p>
                <div className="flex justify-between items-center pt-2">
                   <div className="flex flex-col">
                     <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Base Protocol</span>
                     <span className="text-xs font-black text-white">₹{dest.baseCost.toLocaleString()}</span>
                   </div>
                   <button 
                     onClick={() => setInputs({ ...inputs, targetDestination: dest.name })}
                     className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                       inputs.targetDestination === dest.name 
                         ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.3)]' 
                         : 'bg-white/5 text-slate-400 border border-white/10 hover:border-cyan-400 hover:text-cyan-400'
                     }`}
                   >
                     {inputs.targetDestination === dest.name ? 'Locked In' : 'Select'}
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full glass p-12 rounded-3xl border-dashed border-white/10 text-center opacity-40">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No matching neural signatures found</p>
          </div>
        )}
      </div>
    </div>
  );

  const toggleSection = (id: string) => {
    setActiveSection(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
      {/* Visualiser Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="max-w-4xl w-full glass rounded-[3rem] border border-white/10 overflow-hidden relative shadow-2xl">
            <button onClick={() => setSelectedPlace(null)} className="absolute top-8 right-8 w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all z-20"><i className="fas fa-times"></i></button>
            <div className="grid md:grid-cols-2">
              <div className="h-[400px] md:h-[600px] bg-slate-900 relative flex items-center justify-center">
                {isGeneratingImage ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
                    <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest animate-pulse">Synthesizing Pixels...</span>
                  </div>
                ) : placeImageUrl && <img src={placeImageUrl} className="w-full h-full object-cover" />}
              </div>
              <div className="p-10 space-y-6 flex flex-col justify-center">
                <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Neural Visualization</span>
                <h2 className="text-4xl font-black font-orbitron text-white leading-none uppercase">{selectedPlace.name}</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{selectedPlace.description}</p>
                <button onClick={() => setSelectedPlace(null)} className="py-3 px-6 glass border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-300 hover:text-white transition-all w-fit">Dismiss Overlay</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black font-orbitron mb-2 tracking-tighter">Plan <span className="neon-text-cyan">Synthesis</span></h1>
        <p className="text-slate-400 uppercase text-[10px] tracking-[0.4em] font-bold">India, Engineered Smarter</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-3xl border-white/10 space-y-6 sticky top-28 shadow-xl">
            <h3 className="text-lg font-bold font-orbitron uppercase text-white border-b border-white/10 pb-4">Parameters</h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Destination Essence</label>
              <div className="flex flex-wrap gap-2">
                {destinationCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setInputs({ ...inputs, destinationType: cat, targetDestination: '' })}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                      inputs.destinationType === cat 
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                        : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Days</label><input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" value={inputs.duration} onChange={e => setInputs({...inputs, duration: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">People</label><input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" value={inputs.persons} onChange={e => setInputs({...inputs, persons: e.target.value})} /></div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Trip Start Date</label>
              <input 
                type="date" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs" 
                value={inputs.departureDate} 
                onChange={e => setInputs({...inputs, departureDate: e.target.value})} 
              />
            </div>
            
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Total Budget (₹)</label><input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" value={inputs.budget} onChange={e => setInputs({...inputs, budget: e.target.value})} /></div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">What’s your travel mood?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Calm', icon: 'fa-leaf', desc: 'Relaxation & Nature' },
                  { id: 'Excited', icon: 'fa-bolt', desc: 'Energy & Attractions' },
                  { id: 'Romantic', icon: 'fa-heart', desc: 'Views & Privacy' },
                  { id: 'Exploratory', icon: 'fa-compass', desc: 'Offbeat & Culture' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setInputs({ ...inputs, mood: m.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      inputs.mood === m.id 
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.1)]' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <i className={`fas ${m.icon} text-[10px] ${inputs.mood === m.id ? 'text-cyan-400' : 'text-slate-500'}`}></i>
                      <span className={`text-[10px] font-black uppercase ${inputs.mood === m.id ? 'text-white' : 'text-slate-400'}`}>{m.id}</span>
                    </div>
                    <p className="text-[8px] text-slate-500 font-bold leading-tight">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-4 glass rounded-2xl border border-white/10">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                     <i className="fas fa-tractor text-xs"></i>
                   </div>
                   <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-pointer" htmlFor="village-mode">Village-Friendly Mode</label>
                 </div>
                 <input 
                   id="village-mode"
                   type="checkbox" 
                   className="w-5 h-5 accent-emerald-500 cursor-pointer" 
                   checked={inputs.villageFriendlyMode}
                   onChange={(e) => setInputs({ ...inputs, villageFriendlyMode: e.target.checked })}
                 />
               </div>
               <p className="text-[8px] text-slate-500 font-bold leading-relaxed">Prioritizes realistic local bus, auto, and walk routes. Ideal for small towns and rural departures.</p>
            </div>

            <div className="space-y-1 relative">
              <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-500 uppercase">Starting Point</label><button onClick={handleGetCurrentLocation} className="text-[8px] font-black uppercase text-cyan-400">{isLocating ? 'Locating...' : 'Auto-Detect'}</button></div>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" value={inputs.location} onFocus={() => setShowLocationSuggestions(true)} onChange={e => {setInputs({...inputs, location: e.target.value}); fetchLocationSuggestions(e.target.value);}} />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-40 w-full glass rounded-xl border border-white/10 mt-1 max-h-48 overflow-y-auto">
                   <div className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer text-cyan-400 text-xs font-bold" onClick={handleGetCurrentLocation}><i className="fas fa-crosshairs mr-2"></i> Use My Current Location</div>
                  {locationSuggestions.map((s, i) => (<div key={i} className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer text-xs text-white" onClick={() => {setInputs({...inputs, location: s.name}); setShowLocationSuggestions(false);}}>{s.name}</div>))}
                </div>
              )}
            </div>

            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Transport Mode</label><select className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" value={inputs.transport} onChange={e => setInputs({...inputs, transport: e.target.value as TransportMode})}><option value="" disabled>Select</option>{Object.values(TransportMode).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            
            <button onClick={() => generatePlanAction(inputs)} disabled={isGenerating || !inputs.targetDestination} className={`w-full py-4 rounded-xl font-black font-orbitron uppercase tracking-widest transition-all ${isGenerating || !inputs.targetDestination ? 'bg-slate-800 text-slate-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(0,243,255,0.3)]'}`}>
              {isGenerating ? <i className="fas fa-spinner fa-spin mr-2"></i> : null} {isGenerating ? 'Synthesizing...' : !inputs.targetDestination ? 'Select Destination' : 'Synthesize Plan'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {isGenerating ? (
            <div className="glass h-[600px] rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12 space-y-4">
              <div className="w-20 h-20 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xl font-black font-orbitron text-white uppercase tracking-widest">Neural Synthesis Protocol</p>
              <p className="text-slate-500 text-sm">Calculating transport vectors and ground truths...</p>
            </div>
          ) : generatedPlan ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700 pb-20">
              
              {/* 1. Header & Weather Intelligence */}
              <div className="glass p-8 rounded-[3rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col gap-6 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-cyan-400/30">Verified Destination</span>
                    <h2 className="text-5xl font-black font-orbitron text-white uppercase mt-2 tracking-tighter">{generatedPlan.destination}</h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleSaveTrip}
                      disabled={isTripSaved}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center space-x-2 ${
                        isTripSaved 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30 cursor-default' 
                          : 'bg-cyan-500/20 text-cyan-400 border-cyan-400/50 hover:bg-cyan-400 hover:text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                      }`}
                    >
                      <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : isTripSaved ? 'fa-check' : 'fa-bookmark'}`}></i>
                      <span>{isTripSaved ? 'Mission Saved' : 'Save Mission'}</span>
                    </button>
                    <button 
                      onClick={handleDownloadAndSave}
                      className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center space-x-2 bg-white text-slate-950 hover:bg-purple-500 hover:text-white border-white/20 shadow-lg"
                    >
                      <i className={`fas ${isDownloading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                      <span>Download Plan Package</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-row gap-4">
                  <div className="glass p-4 rounded-2xl border-white/10 text-center flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Est.</p>
                    <p className="text-2xl font-black text-cyan-400">₹{generatedPlan.totalEstimatedCost.toLocaleString()}</p>
                  </div>
                  <div className="glass p-4 rounded-2xl border-white/10 text-center flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Climate</p>
                    <p className="text-2xl font-black text-white">{generatedPlan.weather.temperature}</p>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase mt-1">{generatedPlan.weather.condition}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-slate-300 text-base font-medium leading-relaxed">{generatedPlan.transitSummary}</p>
                </div>
              </div>

              {/* 2. Confidence Score */}
              {confidenceData && (
                <div className="glass p-8 rounded-[3rem] border border-white/10 flex flex-col md:flex-row items-center gap-10 shadow-xl bg-gradient-to-r from-slate-900/40 to-cyan-500/5">
                  <div className="text-center md:border-r border-white/10 md:pr-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Trip Confidence</p>
                    <div className="text-6xl font-black text-cyan-400 font-orbitron drop-shadow-[0_0_15px_rgba(0,243,255,0.4)]">{confidenceData.total}%</div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-10 flex-1">
                    {confidenceData.factors.map((f, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg glass border border-cyan-400/20 flex items-center justify-center text-cyan-400 text-xs">
                          <i className={`fas ${f.icon}`}></i>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase">{f.label}</p>
                          <p className="text-xs font-bold text-white flex items-center">
                            <i className="fas fa-check-circle text-[8px] text-cyan-400 mr-2"></i>
                            {f.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Trade-Off Simulator */}
              <div className="glass p-8 rounded-[3rem] border border-white/10 space-y-8 bg-slate-900/20 shadow-xl">
                <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-purple-400 border border-purple-400/20">
                    <i className="fas fa-sliders-h"></i>
                  </div>
                  <h3 className="text-2xl font-black font-orbitron uppercase tracking-widest text-white">Trip Trade-Off Simulator</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>Maximum Comfort</span>
                      <span>Lower Cost</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg cursor-pointer transition-all"
                      value={tradeOffs.comfort}
                      onChange={(e) => setTradeOffs({ ...tradeOffs, comfort: parseInt(e.target.value) })}
                    />
                    <p className="text-[9px] text-center font-bold text-cyan-400 uppercase tracking-widest">Slider 1: Comfort ↔ Cost</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>Faster Travel</span>
                      <span>Scenic Experience</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      className="w-full accent-purple-400 h-1 bg-white/10 rounded-lg cursor-pointer transition-all"
                      value={tradeOffs.pacing}
                      onChange={(e) => setTradeOffs({ ...tradeOffs, pacing: parseInt(e.target.value) })}
                    />
                    <p className="text-[9px] text-center font-bold text-purple-400 uppercase tracking-widest">Slider 2: Speed ↔ Scenic</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Trade-Off Result</span>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    <i className="fas fa-robot text-cyan-400 mr-3"></i>
                    {tradeOffFeedback}
                  </p>
                </div>
              </div>

              {/* 4. Optimized Local Grid */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black font-orbitron uppercase tracking-widest flex items-center text-white">
                  <span className="w-10 h-10 glass rounded-xl flex items-center justify-center text-cyan-400 mr-4 border border-cyan-400/20"><i className="fas fa-route text-sm"></i></span>
                  Optimized Local Grid
                </h3>
                
                <div className="relative group overflow-hidden rounded-[3rem] border border-cyan-400/20 glass hover:border-cyan-400/50 transition-all shadow-2xl">
                  <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer" className="block relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity"></div>
                    <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop" alt="Strategic Roadmap" className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute bottom-10 left-12 z-20">
                      <p className="text-[12px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-3">Tactical Vector Protocol</p>
                      <h4 className="text-4xl font-black font-orbitron text-white uppercase tracking-tighter leading-none">Initialize Sequenced Navigation</h4>
                      <p className="text-slate-400 text-sm mt-3 font-medium opacity-80">Synchronizing {generatedPlan.sightseeing.length} waypoints with Maps...</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* 5. Synthesis Flow (Collapsible Box) */}
              <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                <button 
                  onClick={() => toggleSection('itinerary')}
                  className="w-full flex items-center justify-between p-6 bg-slate-900/60 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-400/20 group-hover:neon-border transition-all">
                      <i className="fas fa-stream text-sm"></i>
                    </div>
                    <h3 className="text-xl font-black font-orbitron uppercase tracking-widest text-white">Synthesis Flow</h3>
                  </div>
                  <i className={`fas fa-chevron-down text-cyan-400 transition-transform ${activeSection === 'itinerary' ? 'rotate-180' : ''}`}></i>
                </button>
                {activeSection === 'itinerary' && (
                  <div className="p-6 space-y-4 bg-slate-950/20 border-t border-white/5 animate-in slide-in-from-top duration-300">
                    {generatedPlan.itinerary.map((day, idx) => (
                      <div key={idx} className="glass p-6 rounded-2xl border-white/10 bg-slate-900/40 group">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center space-x-3"><span className="text-lg font-black font-orbitron text-cyan-400">0{day.day}</span><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day.theme}</span></div>
                          <span className="text-[9px] text-slate-600 font-bold px-3 py-1 rounded-full border border-white/5">₹{day.estimatedCost.toLocaleString()}</span>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="space-y-1"><p className="text-[8px] font-black text-cyan-500 uppercase">Morning</p><p className="text-[11px] text-slate-300">{day.morning}</p></div>
                          <div className="space-y-1"><p className="text-[8px] font-black text-purple-500 uppercase">Afternoon</p><p className="text-[11px] text-slate-300">{day.afternoon}</p></div>
                          <div className="space-y-1"><p className="text-[8px] font-black text-blue-500 uppercase">Evening</p><p className="text-[11px] text-slate-300">{day.evening}</p></div>
                          <div className="space-y-1 bg-cyan-400/5 p-3 rounded-lg"><p className="text-[8px] font-black text-yellow-500 uppercase">Gastronomy</p><p className="text-[11px] text-slate-200 font-bold italic">{day.foodHighlight}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Strategic Accommodations (Collapsible Box) */}
              <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                <button 
                  onClick={() => toggleSection('accommodations')}
                  className="w-full flex items-center justify-between p-6 bg-slate-900/60 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-purple-400 border border-purple-400/20 group-hover:neon-border transition-all">
                      <i className="fas fa-hotel text-sm"></i>
                    </div>
                    <h3 className="text-xl font-black font-orbitron uppercase tracking-widest text-white">Strategic Accommodations</h3>
                  </div>
                  <i className={`fas fa-chevron-down text-purple-400 transition-transform ${activeSection === 'accommodations' ? 'rotate-180' : ''}`}></i>
                </button>
                {activeSection === 'accommodations' && (
                  <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-950/20 border-t border-white/5 animate-in slide-in-from-top duration-300">
                    {generatedPlan.accommodations.map((stay, idx) => (
                      <div key={idx} className="glass p-5 rounded-2xl border-white/10 bg-slate-950/20 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-white text-xs line-clamp-1">{stay.name}</h4>
                          <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 uppercase">{stay.type}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 flex-grow mb-4 leading-relaxed line-clamp-3">{stay.description}</p>
                        
                        <div className="border-t border-white/5 pt-3 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-white">₹{stay.pricePerNight.toLocaleString()}</span>
                            <div className="flex space-x-2">
                               <a 
                                 href={stay.contactInfo.startsWith('http') ? stay.contactInfo : `tel:${stay.contactInfo}`} 
                                 target={stay.contactInfo.startsWith('http') ? "_blank" : undefined}
                                 rel={stay.contactInfo.startsWith('http') ? "noopener noreferrer" : undefined}
                                 className="px-3 py-1.5 glass rounded-lg text-[8px] font-black uppercase text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 transition-all border border-cyan-400/20"
                               >
                                 Contact
                               </a>
                               <button 
                                 onClick={() => handleBookAccommodation(stay)}
                                 className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 rounded-lg text-[8px] font-black uppercase hover:bg-cyan-400 hover:text-slate-950 transition-all shadow-lg"
                               >
                                 Book Now
                               </button>
                            </div>
                          </div>
                          <div className="bg-slate-900/40 p-2 rounded-lg border border-white/5">
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Contact Node</p>
                            <p className="text-[10px] text-slate-300 font-bold truncate">{stay.contactInfo}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 7. Transport Options (Collapsible Box) */}
              <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                <button 
                  onClick={() => toggleSection('transport')}
                  className="w-full flex items-center justify-between p-6 bg-slate-900/60 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-blue-400 border border-blue-400/20 group-hover:neon-border transition-all">
                      <i className="fas fa-plane-departure text-sm"></i>
                    </div>
                    <h3 className="text-xl font-black font-orbitron uppercase tracking-widest text-white">Recommended Carriers</h3>
                  </div>
                  <i className={`fas fa-chevron-down text-blue-400 transition-transform ${activeSection === 'transport' ? 'rotate-180' : ''}`}></i>
                </button>
                {activeSection === 'transport' && (
                  <div className="p-6 grid md:grid-cols-3 gap-4 bg-slate-950/20 border-t border-white/5 animate-in slide-in-from-top duration-300">
                    {generatedPlan.transportOptions.map((opt, i) => (
                      <div key={i} className="glass p-4 rounded-2xl border-white/10 bg-slate-900/30">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Carrier</p>
                        <h4 className="text-xs font-bold text-white">{opt.name}</h4>
                        <p className="text-[9px] text-slate-400 mt-1">{opt.details}</p>
                        <div className="flex justify-between items-center mt-3 border-t border-white/5 pt-2">
                          <span className="text-[8px] font-bold text-cyan-400 uppercase">{opt.schedule}</span>
                          <span className="text-[10px] font-black text-white">{opt.priceEst}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 8. Discovery Protocol (Collapsible Box) */}
              <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                <button 
                  onClick={() => toggleSection('discovery')}
                  className="w-full flex items-center justify-between p-6 bg-slate-900/60 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-400/20 group-hover:neon-border transition-all">
                      <i className="fas fa-map-marker-alt text-sm"></i>
                    </div>
                    <h3 className="text-xl font-black font-orbitron uppercase tracking-widest text-white">Neural Discovery Protocol</h3>
                  </div>
                  <i className={`fas fa-chevron-down text-cyan-400 transition-transform ${activeSection === 'discovery' ? 'rotate-180' : ''}`}></i>
                </button>
                {activeSection === 'discovery' && (
                  <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-950/20 border-t border-white/5 animate-in slide-in-from-top duration-300">
                    {generatedPlan.sightseeing.map((place, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleVisualiseLandmark(place)}
                        className="group relative glass rounded-2xl overflow-hidden border border-white/10 bg-slate-900/30 hover:border-cyan-400/40 transition-all cursor-pointer p-5"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm text-white group-hover:neon-text-cyan transition-colors">{place.name}</h4>
                          <i className="fas fa-eye text-cyan-400 text-[10px] opacity-40 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{place.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 9. Smart Packing Assistant (Collapsible Box) */}
              {packingChecklist && (
                <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                  <button 
                    onClick={() => toggleSection('packing')}
                    className="w-full flex items-center justify-between p-6 bg-slate-900/60 hover:bg-slate-900 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-400/20 group-hover:neon-border transition-all">
                        <i className="fas fa-briefcase text-sm"></i>
                      </div>
                      <h3 className="text-xl font-black font-orbitron uppercase tracking-widest text-white">Smart Packing Assistant</h3>
                    </div>
                    <i className={`fas fa-chevron-down text-emerald-400 transition-transform ${activeSection === 'packing' ? 'rotate-180' : ''}`}></i>
                  </button>
                  {activeSection === 'packing' && (
                    <div className="p-6 grid md:grid-cols-3 gap-6 bg-slate-950/20 border-t border-white/5 animate-in slide-in-from-top duration-300">
                      <div className="glass p-6 rounded-3xl border-white/10 bg-slate-900/40 space-y-4 shadow-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20 text-xs"><i className="fas fa-tshirt"></i></div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Clothes</span>
                        </div>
                        <ul className="space-y-3">
                          {packingChecklist.clothes.map((item, idx) => (
                            <li key={idx} className="flex items-start space-x-3 group"><div className="mt-1 w-2 h-2 rounded-full border border-cyan-400/50 flex items-center justify-center"><div className="w-1 h-1 bg-cyan-400 rounded-full"></div></div><span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors">{item}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div className="glass p-6 rounded-3xl border-white/10 bg-slate-900/40 space-y-4 shadow-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 border border-red-400/20 text-xs"><i className="fas fa-pills"></i></div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Medicines</span>
                        </div>
                        <ul className="space-y-3">
                          {packingChecklist.medicines.map((item, idx) => (
                            <li key={idx} className="flex items-start space-x-3 group"><div className="mt-1 w-2 h-2 rounded-full border border-red-400/50 flex items-center justify-center"><div className="w-1 h-1 bg-red-400 rounded-full"></div></div><span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors">{item}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div className="glass p-6 rounded-3xl border-white/10 bg-slate-900/40 space-y-4 shadow-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-400/20 text-xs"><i className="fas fa-suitcase"></i></div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Essentials</span>
                        </div>
                        <ul className="space-y-3">
                          {packingChecklist.essentials.map((item, idx) => (
                            <li key={idx} className="flex items-start space-x-3 group"><div className="mt-1 w-2 h-2 rounded-full border border-red-400/50 flex items-center justify-center"><div className="w-1 h-1 bg-red-400 rounded-full"></div></div><span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors">{item}</span></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 10. Offline-First Travel Pack (Collapsible Box) */}
              <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                <button 
                  onClick={() => toggleSection('offline_pack')}
                  className="w-full flex items-center justify-between p-6 bg-slate-900/60 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-400/20 group-hover:neon-border transition-all">
                      <i className="fas fa-map-marked-alt text-sm"></i>
                    </div>
                    <h3 className="text-xl font-black font-orbitron uppercase tracking-widest text-white">📍 Offline-First Travel Pack</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDownloadOfflinePack(); }}
                      className="hidden md:flex px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 text-[8px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                    >
                      {isDownloadingPack ? 'Syncing...' : 'Download Pack'}
                    </button>
                    <i className={`fas fa-chevron-down text-cyan-400 transition-transform ${activeSection === 'offline_pack' ? 'rotate-180' : ''}`}></i>
                  </div>
                </button>
                {activeSection === 'offline_pack' && (
                  <div className="p-6 space-y-6 bg-slate-950/20 border-t border-white/5 animate-in slide-in-from-top duration-300">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                        <div className="flex items-center space-x-2 text-cyan-400"><i className="fas fa-phone-square-alt text-lg"></i><span className="text-[10px] font-black uppercase">Emergency</span></div>
                        <div className="space-y-3">
                          {generatedPlan.emergencyContacts.map((c, i) => (
                            <div key={i} className="border-l-2 border-red-500/50 pl-3">
                              <p className="text-[8px] font-black text-slate-500 uppercase">{c.category}</p>
                              <p className="text-[10px] text-white font-bold">{c.name}</p>
                              <p className="text-[11px] text-cyan-400 font-mono">{c.contact}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                        <div className="flex items-center space-x-2 text-purple-400"><i className="fas fa-comments text-lg"></i><span className="text-[10px] font-black uppercase">Dialect</span></div>
                        <div className="space-y-3">
                          {generatedPlan.localPhrases.slice(0, 3).map((p, i) => (
                            <div key={i} className="space-y-1">
                              <p className="text-[8px] font-black text-slate-500 uppercase">{p.english}</p>
                              <p className="text-[11px] text-white font-bold">{p.local}</p>
                              <p className="text-[9px] text-purple-400 italic">"{p.phonetic}"</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                        <div className="flex items-center space-x-2 text-yellow-400"><i className="fas fa-utensils text-lg"></i><span className="text-[10px] font-black uppercase">Sustenance</span></div>
                        <div className="space-y-3">
                          {generatedPlan.offlineFoodRecommendations.map((f, i) => (
                            <div key={i} className="border-l-2 border-yellow-500/50 pl-3">
                              <p className="text-[10px] text-white font-bold">{f.dish}</p>
                              <p className="text-[8px] font-black text-slate-500 uppercase">{f.placeType}</p>
                              <p className="text-[9px] text-yellow-400 font-bold">{f.priceRange}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                        <div className="flex items-center space-x-2 text-blue-400"><i className="fas fa-compass text-lg"></i><span className="text-[10px] font-black uppercase">Nav Vectors</span></div>
                        <div className="space-y-3">
                          {generatedPlan.mapGuide.slice(0, 2).map((m, i) => (
                            <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                              <p className="text-[10px] text-slate-300 leading-tight mb-2">{m.instruction}</p>
                              <div className="flex items-center text-[8px] font-black text-blue-400 uppercase"><i className="fas fa-landmark mr-1"></i> {m.landmark}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center space-x-4">
                       <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400"><i className="fas fa-info-circle text-sm"></i></div>
                       <p className="text-xs text-slate-400 font-medium">This pack contains static route guidance, local contacts, and language essentials designed for utility in dead zones. Download as a single Tactical Bundle for offline storage.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 11. Village-Friendly Travel Details (Collapsible Box) */}
              {generatedPlan.villageDetails && (
                <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                  <button 
                    onClick={() => toggleSection('village_mode')}
                    className="w-full flex items-center justify-between p-6 bg-slate-900/60 hover:bg-slate-900 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-400/20 group-hover:neon-border transition-all">
                        <i className="fas fa-seedling text-sm"></i>
                      </div>
                      <h3 className="text-xl font-black font-orbitron uppercase tracking-widest text-white">🌾 Village-Friendly Travel Details</h3>
                    </div>
                    <i className={`fas fa-chevron-down text-emerald-400 transition-transform ${activeSection === 'village_mode' ? 'rotate-180' : ''}`}></i>
                  </button>
                  {activeSection === 'village_mode' && (
                    <div className="p-6 space-y-6 bg-slate-950/20 border-t border-white/5 animate-in slide-in-from-top duration-300">
                      <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="glass p-6 rounded-3xl border-white/5 space-y-6 bg-emerald-500/5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Tactical Travel Path</span>
                              <span className="px-3 py-1 glass border border-emerald-500/20 rounded-lg text-[8px] font-black text-white uppercase tracking-widest">{generatedPlan.villageDetails.transportSequence}</span>
                            </div>
                            <div className="space-y-4">
                              {generatedPlan.villageDetails.stepByStepPath.map((step, idx) => (
                                <div key={idx} className="flex items-start space-x-4 group">
                                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400 flex-shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">{idx + 1}</div>
                                  <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Nearest Railway Hub</p>
                              <div className="flex items-center space-x-2">
                                 <i className="fas fa-train text-emerald-400 text-xs"></i>
                                 <p className="text-sm font-black text-white uppercase">{generatedPlan.villageDetails.nearestStation}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Local Timing Reality</p>
                              <div className="flex items-center space-x-2">
                                 <i className="fas fa-clock text-emerald-400 text-xs"></i>
                                 <p className="text-xs font-bold text-slate-200">{generatedPlan.villageDetails.localTimings}</p>
                              </div>
                            </div>
                          </div>

                          <div className="glass p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                             <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Practical Village Intel</p>
                             <ul className="space-y-2">
                                {generatedPlan.villageDetails.practicalNotes.map((note, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <i className="fas fa-check text-[7px] text-emerald-500 mt-1"></i>
                                    <p className="text-[10px] text-slate-400 leading-tight">{note}</p>
                                  </li>
                                ))}
                             </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 12. Destination Intelligence Profile (Collapsible Box) */}
              {generatedPlan.intelligence && (
                <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                  <button 
                    onClick={() => toggleSection('intelligence')}
                    className="w-full flex items-center justify-between p-6 bg-slate-900/60 hover:bg-slate-900 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-400/20 group-hover:neon-border transition-all">
                        <i className="fas fa-database text-sm"></i>
                      </div>
                      <h3 className="text-xl font-black font-orbitron uppercase tracking-widest text-white">📡 Destination Intelligence</h3>
                    </div>
                    <i className={`fas fa-chevron-down text-cyan-400 transition-transform ${activeSection === 'intelligence' ? 'rotate-180' : ''}`}></i>
                  </button>
                  {activeSection === 'intelligence' && (
                    <div className="p-6 space-y-6 bg-slate-950/20 border-t border-white/5 animate-in slide-in-from-top duration-300">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="glass p-6 rounded-3xl border-white/5 space-y-2">
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">1. Best Time to Visit</p>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{generatedPlan.intelligence.bestTimeToVisit}</p>
                          </div>
                          <div className="glass p-6 rounded-3xl border-white/5 space-y-2">
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">2. Network Availability</p>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{generatedPlan.intelligence.networkAvailability}</p>
                          </div>
                          <div className="glass p-6 rounded-3xl border-white/5 space-y-2">
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">3. Difficulty Level</p>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                                generatedPlan.intelligence.difficultyLevel.label === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                generatedPlan.intelligence.difficultyLevel.label === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {generatedPlan.intelligence.difficultyLevel.label}
                              </span>
                              <p className="text-xs text-slate-400 font-medium">{generatedPlan.intelligence.difficultyLevel.explanation}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">4. Pros & Cons</p>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Pros</p>
                                {generatedPlan.intelligence.prosAndCons.pros.map((p, i) => (
                                  <p key={i} className="text-xs text-slate-300 font-medium">- {p}</p>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Cons</p>
                                {generatedPlan.intelligence.prosAndCons.cons.map((c, i) => (
                                  <p key={i} className="text-xs text-slate-300 font-medium">- {c}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="glass p-6 rounded-3xl border-white/5 space-y-3">
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">5. Most Forgotten Items</p>
                            <div className="flex flex-wrap gap-2">
                              {generatedPlan.intelligence.mostForgottenItems.map((item, i) => (
                                <span key={i} className="px-3 py-1 glass rounded-lg border border-white/5 text-[10px] text-slate-400 font-medium">- {item}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 13. Mission Finalization Section */}
              <div className="glass p-10 rounded-[3rem] border border-cyan-400/20 bg-gradient-to-br from-slate-900 to-cyan-500/5 space-y-6 shadow-2xl relative overflow-hidden text-center">
                 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><i className="fas fa-shield-alt text-8xl"></i></div>
                 <h3 className="text-3xl font-black font-orbitron uppercase tracking-tighter text-white">Finalize Mission Archive</h3>
                 <p className="text-slate-400 text-sm max-w-xl mx-auto">Lock these parameters into your neural profile to access this itinerary, budget breakdown, and packing list anytime from your dashboard.</p>
                 
                 <div className="flex flex-col items-center justify-center gap-4 pt-4">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <button 
                        onClick={handleSaveTrip}
                        disabled={isTripSaved}
                        className={`group relative px-10 py-5 rounded-2xl font-black font-orbitron uppercase tracking-[0.2em] transition-all flex items-center space-x-4 ${
                          isTripSaved 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30' 
                            : 'bg-white text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,243,255,0.3)]'
                        }`}
                      >
                        <i className={`fas ${isSaving ? 'fa-sync fa-spin' : isTripSaved ? 'fa-check-double' : 'fa-archive'}`}></i>
                        <span>{isTripSaved ? 'Mission Archived' : 'Lock Mission to Profile'}</span>
                      </button>

                      <button 
                        onClick={handleDownloadAndSave}
                        className="group relative px-10 py-5 rounded-2xl font-black font-orbitron uppercase tracking-[0.2em] transition-all flex items-center space-x-4 bg-slate-900 border border-white/10 text-white hover:border-purple-400/50 hover:bg-purple-400/10 shadow-xl"
                      >
                        <i className={`fas ${isDownloading ? 'fa-sync fa-spin' : 'fa-download'}`}></i>
                        <span>Download Plan Pack</span>
                      </button>
                    </div>
                    {isTripSaved && (
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">Neural Link Established • Mission Synced</p>
                    )}
                 </div>
              </div>

              {/* 14. Explore Related Territories */}
              <RecommendationsGrid title="Explore Related Territories" />

              {generatedPlan.sources.length > 0 && (
                <div className="pt-8 border-t border-white/5 flex flex-wrap gap-4">
                  {generatedPlan.sources.map((s, i) => (<a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="glass px-4 py-2 rounded-xl text-[10px] text-cyan-400 border border-cyan-400/20 hover:border-cyan-400 transition-all"><i className="fas fa-link mr-2"></i> {s.title}</a>))}
                </div>
              )}
              
              <button onClick={() => setGeneratedPlan(null)} className="w-full py-5 glass border border-white/10 rounded-3xl text-slate-600 font-bold uppercase tracking-[0.5em] text-[10px] hover:text-white transition-all"><i className="fas fa-sync-alt mr-4"></i> Recalibrate Mission Parameters</button>
            </div>
          ) : (
            <div className="space-y-12 pb-20">
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <div className="glass p-12 rounded-[3rem] border-white/10 space-y-4 shadow-2xl">
                   <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Viability Assessment</h4>
                   <div className="text-6xl font-black text-white font-orbitron drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">?</div>
                   <p className="text-xl font-black uppercase tracking-[0.2em]" style={{ color: viability.color }}>{viability.score}</p>
                </div>
                <div className="glass p-12 rounded-[3rem] border-white/10 space-y-6 shadow-2xl">
                   <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Projected Allocation</h4>
                   <div className="h-28"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={35} outerRadius={45} paddingAngle={4} dataKey="value">{chartData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.6} strokeWidth={0} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', fontSize: '10px', borderRadius: '8px' }} /></PieChart></ResponsiveContainer></div>
                   <div className="flex justify-center space-x-4"><div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-cyan-400"></div><span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Transit</span></div><div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-purple-400"></div><span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Stays</span></div></div>
                </div>
              </div>

              <RecommendationsGrid title="Neural Recommendations" />

              <div className="glass h-[200px] rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-40">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 shadow-inner"><i className="fas fa-terminal text-xl"></i></div>
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Awaiting Final Synthesis Command</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customization;
