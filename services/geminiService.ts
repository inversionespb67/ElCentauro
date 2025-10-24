import { GoogleGenAI } from "@google/genai";
import type { Coordinates, RouteInfo } from '../types';

const DESTINATION_ADDRESS = "Barrio El Centauro, Sargento Cabral 2800, 1804 Esteban Echeverria, Buenos Aires, Argentina";

export async function getRouteInfo(start: Coordinates): Promise<RouteInfo> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Calcula la distancia y el tiempo estimado de viaje en coche desde la ubicación actual hasta '${DESTINATION_ADDRESS}'. Responde únicamente con un objeto JSON que tenga las claves 'distancia' y 'tiempo'. Por ejemplo: {"distancia": "10 km", "tiempo": "25 minutos"}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: start.latitude,
                            longitude: start.longitude
                        }
                    }
                }
            },
        });

        const textResponse = response.text.trim();
        const jsonString = textResponse.replace(/^```json\s*|```$/g, '');
        
        const data: RouteInfo = JSON.parse(jsonString);

        if (!data.distancia || !data.tiempo) {
            throw new Error("Respuesta inválida de la API. Faltan datos de distancia o tiempo.");
        }

        return data;

    } catch (error) {
        console.error("Error al obtener la información de la ruta:", error);
        if (error instanceof SyntaxError) {
             throw new Error("No se pudo analizar la respuesta de la API. Inténtalo de nuevo.");
        }
        throw new Error("No se pudo obtener la información de la ruta. Por favor, inténtalo de nuevo más tarde.");
    }
}
