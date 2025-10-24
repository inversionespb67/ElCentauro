import React, { useState, useCallback, useMemo } from 'react';
import type { Coordinates, RouteInfo } from './types';
import { getRouteInfo } from './services/geminiService';

const DESTINATION_ADDRESS = "Barrio El Centauro, Sargento Cabral 2800, Esteban Echeverría, Buenos Aires";

type AppState = 'initial' | 'loading' | 'results' | 'error';

const InitialView: React.FC<{ onStart: () => void; isFading: boolean }> = ({ onStart, isFading }) => (
    <div className={`flex flex-col h-full justify-between items-center text-center transition-all duration-500 ${isFading ? 'fade-out' : 'animate-fade-in'}`}>
        <div className="w-full pt-8">
            <div className="bg-white rounded-2xl shadow-lg inline-block p-4">
              <img src="./centauro.png" alt="El Centauro Logo" className="w-64 h-auto" />
            </div>
            <p className="mt-8 text-xl text-gray-300">¿Listo para tu aventura hacia El Centauro?</p>
        </div>
        
        <button
            onClick={onStart}
            className="w-full max-w-xs px-6 py-4 bg-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
        >
            ✨ Iniciar Mi Misión ✨
        </button>
        
        <p className="pb-4 text-xs text-gray-500">
            {DESTINATION_ADDRESS}
        </p>
    </div>
);


const LoadingView: React.FC = () => (
    <div className="text-center animate-fade-in flex flex-col items-center justify-center h-full space-y-6">
        <div className="w-48 h-48 rounded-full border-2 border-emerald-500/50 relative overflow-hidden flex items-center justify-center radar-sweep-animation">
            <div className="w-2/3 h-2/3 rounded-full border-2 border-dashed border-emerald-500/30"></div>
            <div className="absolute w-1/3 h-1/3 rounded-full border-2 border-emerald-500/40"></div>
        </div>
        <p className="text-gray-300 font-medium text-lg">Localizando tu posición… ⏳</p>
    </div>
);

const ErrorView: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center animate-fade-in space-y-6 p-4 bg-gray-800/50 rounded-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        <div>
            <h2 className="font-bold text-2xl text-red-300">Misión Abortada</h2>
            <p className="mt-2 text-red-400">{message}</p>
        </div>
        <button
            onClick={onRetry}
            className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-colors"
        >
            Reintentar Misión
        </button>
    </div>
);

const ResultsView: React.FC<{ info: RouteInfo; url: string; onReset: () => void; }> = ({ info, url, onReset }) => (
    <div className="w-full space-y-8 animate-fade-in text-center">
        <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <p className="text-lg text-emerald-300">¡Bienvenido a bordo!</p>
            <p className="text-white/80 mt-1">Tu portal a El Centauro está listo.</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-2xl border border-emerald-500/30 shadow-2xl">
            <p className="text-base text-gray-300 uppercase tracking-widest">Destino Revelado</p>
            <div className="mt-4 flex justify-around items-center">
                <div>
                    <span className="text-sm text-emerald-400">Distancia</span>
                    <p className="text-4xl font-bold">{info.distancia}</p>
                </div>
                <div className="h-16 w-px bg-white/20"></div>
                <div>
                    <span className="text-sm text-emerald-400">Tiempo Estimado</span>
                    <p className="text-4xl font-bold">{info.tiempo}</p>
                </div>
            </div>
        </div>

        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
        >
            ✨ Abrir en Google Maps ✨
        </a>
        <button onClick={onReset} className="block w-full mt-4 text-sm text-gray-400 hover:text-gray-200 hover:underline transition-colors">
            Calcular otra ruta
        </button>
    </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isFading, setIsFading] = useState(false);

  const resetState = () => {
      setError(null);
      setRouteInfo(null);
      setCoordinates(null);
      setIsFading(false);
      setAppState('initial');
  };

  const handleGetRoute = useCallback(async () => {
    setAppState('loading');
    setError(null);

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      setAppState('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userCoords: Coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setCoordinates(userCoords);
        try {
          const info = await getRouteInfo(userCoords);
          setRouteInfo(info);
          setAppState('results');
        } catch (err: any) {
          setError(err.message || "No se pudo calcular la ruta.");
          setAppState('error');
        }
      },
      (geoError) => {
        let message = "No se pudo obtener tu ubicación.";
        if (geoError.code === 1) {
            message = "Permiso de ubicación denegado. Revisa la configuración de tu navegador."
        }
        setError(message);
        setAppState('error');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, []);
  
  const startMission = useCallback(() => {
      setIsFading(true);
      setTimeout(() => {
          handleGetRoute();
      }, 500); // Wait for fade out animation
  }, [handleGetRoute]);

  const getGoogleMapsUrl = useMemo(() => {
      if (!coordinates) return '#';
      const destinationEncoded = encodeURIComponent(DESTINATION_ADDRESS);
      return `https://www.google.com/maps/dir/?api=1&origin=${coordinates.latitude},${coordinates.longitude}&destination=${destinationEncoded}`;
  }, [coordinates]);

  const renderContent = () => {
      switch(appState) {
          case 'loading': return <LoadingView />;
          case 'error': return <ErrorView message={error!} onRetry={startMission} />;
          case 'results': return <ResultsView info={routeInfo!} url={getGoogleMapsUrl} onReset={resetState} />;
          case 'initial':
          default:
              return <InitialView onStart={startMission} isFading={isFading} />;
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-sm h-[80vh] min-h-[550px] mx-auto flex flex-col justify-center">
          {renderContent()}
      </main>
    </div>
  );
};

export default App;
