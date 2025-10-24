import React, { useState, useCallback, useMemo } from 'react';
import type { Coordinates, RouteInfo } from './types';
import { getRouteInfo } from './services/geminiService';

const DESTINATION_ADDRESS = "Barrio El Centauro, Sargento Cabral 2800, Esteban Echeverría, Buenos Aires";

const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAA5CAYAAABaCADVAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAvjSURBVHhe7Z1/aBxlHcfPnpfP+z358/7M7M4mCWkkSWsxtJqaGFu1pUYTRaypWmsVq7UaT9TEqFbjSRqSxpJaDSG2VqPaGE1aiyYGFROi1lhjqdY0/uT/bE929+b3fr/fn5n9/L5P3mS7s7OzO7s3I+/7fD/Znd2Z2fn+9HlnZmdn9n1n591E+hYcOHDA3NxcTpw4cV/6Njw8vO7atWuTJk2aO3fufevb8PBwV1ZWVlRUxMXFde7cuc2bN8+bN2/+79/g9fV1L7/88ktvvvnm6dOnb968+fLLL7/88svevXvXrVs3b968W7dulixZUlxcPGvWrLa2tqNHj964cePGjRvjx48/f/58dXX17du3X3/99XvuueeAAw7Yu3fvSy+9tGzZsnPOOWeXXXbZiy++OGLEiPvuu++ZZ555/PHHH3vsseeee27Lli1XXHHFiBEjTjzxRHd39+zZs88880xDQ0NCQgIfH9+IESPOPPPM2tpaS0tLTU1NcXFxQUFBQUFBQUEBT0/P6dOnhw0bFhYWNmbMmDvvvHPTpk03btyYMmVKVlbWqFGjAGzcuHHz5s2zZ8+ePn36/PlzABYvXrx27dr169evX7/+gQMHDhw4cO7cubt37/7444/vvPPOsmXLnnvuuSeffPLuu+8+derUvn37/vGPf7zwwgsvvfTSmTNnDh8+/Nhjjx08eHDhwoUbN25ctGjRqFGjFi5cOGnSpEmTJj169NixY8fOnTuvvvrqsmXLbrvtthdeeOHuu+8eN27cmDFjzjjjDFdXV2NjY1NTU1NTk4+Pz5gxY9555x2vry9PT8+ECRMWLFiwevXquXPnnnvuuYcffhgfH7906dLOzs6CBQveffddLy/Pjh07Xn755StXrrz11ls//elPP/roo5dffvnLL7/U1dXdcccdjzzyyDPPPPOYY445+eSTAwYMWL58+fLlywE88sgjTzzxxBNPPPHbb7995MiRAwYM2Ldv37Zt27Zt2xYsWLBgwbLXX3/9q1/96he/+sWnnnpqwYIFhw4dWrhw4bJly55++uk///nPN2/evG/fviVLlrz33nsDBw6cO3fu888/39TUNEaMGCGTSSaT6e/v//rrr8lkMmNjYzKZzNbWdvr06ebm5j179szNzT18+HBDQ8PevXv/+9//Ojs7W1tbW1tb6+zsbGxsNDU1ffjhhx0dHXNzc0ePHn38+PFt27bdcccdN2zYsGHDBgBff/315s2b165de/To0ZkzZ27evDlhwoQVK1bcddddt27devr06U2bNi1evPjSpUu3b9/+6aefPvzwwy+//PLixYvbt28/ffr07t27X3jhheeff/7dd9+98cYbzz333GefffbWW289++yzDx8+fOLEic2bNy9cuPCTTz55/vnnzz///J133nnzzTdfcsghhw4d+vLLL69du/bKK6+UlJQMHjz46KOP7ty5c/ny5c8//zyTycRiMeFwePny5bNnz25sbFx44YWPPvrordde+/jjj3/xi188/fTTW1tbJ0yYMGTIkAcffPDZZ599//33Dx48eMGCBaNGjRo8ePDmzZvPP//8lVde2blz59y5c48cOfLJJ5987733nnjiiU8++eTFixd//vOf//SnP126dGnw4MG333575MiRRxxxREtLy9LSEpFIbGho4OLi+uijjwC8//77X3nllZUrV27YsOGZZ5554YUXPvnkkwceeODJJ5/83e9+t3r16r59+/bu3XtHR8frr7/+7W9/+9577w0ePHjjxo2HDx/et29fS0tLc3NzW1ubq6urhYWFj49Pa2vrSy+9dPjw4S+++EJPT+/tt99WVFT89Kc/vfjii2+++ea777772Wefvfeee0OHDn3wwQePPfbYwQcfrKurS0hIePvttx89evTgwYN/++23a9euffjhh7t37z516tStW7e2tbWdccYZGRkZwNtvv/3666+/8cYbP/rRj164cOGtt956/PHHH3vsseeee+6VV16ZNGnStWvXPvroozfeeGMymTz//PMHDhwYMWLEvn37vvnmm1dffbWzs7N79+577733/vvv/89//nPYYYesX7/+9ddfX1FREBoaOmPGjJkzZ1pbWzds2DD88MPvvPPOgQMHDhw48Lbbbvvw4cMHH3xw0qRJmzdv3rVr1/Xr17/xxhtPPfXUTZs2TZkyZePGjfPmzZs/f753796rV6/u3r37rbfeymazmzdvzpw584wzzvD09Dw8PFpaWm7duhUUFBQWFnJyciIjIwMDA4GBgaWlpaWlpYmJCYVCwWQy6e/vLy0tHR0draysVFdXW1tb6+zsvPfee0NDQ4GBgYWFhY2Njfv27Xvqqadu3brV0NBw5ZVXnnnmmXvvvffaa6+tqKi46667nn322RdeeGHu3LlTpkyZNWuWp6fn8ccfP3LkyKlTp+bNmzdp0qTx48eXl5eff/75H374Yf/+/Zdffvn06dNvv/322rVrFyxYcOSRR5588sm77rrrrbfeeumnP/3pd7/7XWNjY21t7cc//nFubm5paWloaOjMmTOZmZlNTU07d+5cv359bW3t1KlTL7744rRp00JDQyMiIvLy8v76178+//zzNTU1jY2NSUlJ7e3tbW1tOTk5xcXFeXl5lZWVL7300tSpU6dPn97U1PTyyy8vXrz4xRdfvOaaa2bPnv3BBx8EBQVfeuml559/3sPDA2BgYGD48OH79u0LDw/v27dv+PDhwMDAALBarTfffPNrr7323HPP/fWvf7377rsPHDhwySWXnD17dsKECW+99VaLxaKzs/PYY4+98MILMpkMCoVmz569fv36nTt3HnzwwTfeeOOtt97KzMwE8N5773322Wfr16//+9//vnXr1r59+xYvXvzZZ5/NysqaNGnS/Pnz33zzzdDQUMFg8MMPPzzyyCOPP/74vXv3fvOb3zzxxBM7Oztfeumle++999SpU//+97+PGjXq1ltvnThxYmRkZHR09Oabb/7zn//86KOP9uzZ89prr4WFhaGhofXr1wNYvXp1RUXF+vXrf/vb30JDQz/77LM//vGPhw4devDgwT///PNbt24dOnToX//617p169atW7dnz56ZM2d+9tlnjz/++K1bt3799ddXr14tKio6ffr0zZs3Jycn19fXW1paDh48+Oyzzy5dupSbm7t06dJhw4adccYZZ5999oknnjhgwIBt27YdOnTogw8+uHLlynXr1r355puPPPLIuXPnBg4cOHfu3EcffXTJkiVjxoz5xz/+8Ytf/OKWW27ZsWPHgQMHbr311gsvvDD88MPvvvvuu+66a/LkyYGBgePHj583b97ixYsTExOfPn166dKliIiI+vXr33nnnYmJiUFBQVOnTl2wYEEymTx79myLxaKurj516lR3d/f09PSEhISysjKXl5fValVdXV1dXR0Oh6tXr165cqWhoSEhIWHz5s2PPPLIgw8+OGTIkJ07dz733HNHjx599dVXX3755cWLF3fv3r148eKCBQv27t179erV+/fvHzt27O7du2fPnl1cXJycnExOTo6Li2tqavrwww+rqqpKSkpmzZrV0tKyevXqG2+88dNPPz3//PMbN2687bbbTjzxRNeuXTt27PjFF1/89a9/vWjRonfeeefmm29+4IEHnnnmmfvvv3+rVq1XXHHFNWvWzJo1a+bMmaWlpcDAQFdX1+TJk7/88ktPT89bb7311ltv7dq1q7m5eVFREQCDBw+2tLQsXLhwbW3tLbfc8vLLLwMDA1tbW729vampqYWFhcnJyc8//7y5ufnoo4/+9a9/feSRRy5YsODjjz9eu3btvn37Fi5c+OWXX37zzTc/+clPnnjiifnz54eHh5944onGxsbevXtvvPHGzs7O7du3nzp16tatW5cvX15dXT1u3LgRI0Z8++23r7322rJly957773PP//8s88++9prr915553Dhw8/ePDgwYMHb7vttrVr137yySdvvvnmSy+9dM8997z99tvvv//+Bx98cMeOHStXrvz1r38dMWLEgw8++Oqrr5555pmnnnrqmWeeadu2rbu7e1hY2O7duzMzM2tra21tbV1dXX19fZPJ5NChQwMDA2VlZZWVlRkZGdXV1W1tbYGBgWVlZbm5ud3d3ePj49vb221tbdXV1cnJyQcffHD69Ona2trGxsbe3t7Ozs7a2lpnZ2dNTU1TU9OECRP+9Kc/VVRU/OMf//jJT35yxx13PPjgg//0pz9NnTp148aN/fv3nzlz5vnnn//ggw/6+vq2bdt29OjRf//731944YWXXnrpwIEDjz766MmTJ1taWhYtWvThhx8uXrz4ySefDAwMzJ07t7m5eebMmYmJicHBwTfffPO1115bUlJSUVExefLkW2+9tbCw8Ktf/So8PLy2tvbFF19sampiYmLa2tpqa2t/85vfdHZ2Hn300ZUrV/bv379ixYpNmzY98sgjn3766Z49e1599dVPPvlk8+bNSUnJLl26dHJy+uyzz5599tng4ODXX3/t6+ubmZlZW1v7+OOPV6xY8Zvf/ObVV19dvHjxyy+//NJLL91xxx1PP/306dOnmzdvXrp0KSUlpaqq6ujRowULFmzdunXz5s3XrVv3zDPPvOeee77++usvvPDCxx9/fOzYsWeffXb//v137ty5fv36oUOH3nvvvaVLl3bu3Pnoo49u3ry5uro6JibGz89v/PjxAQMGNDY2Xnrppffee+8zzzwzffr0rVu3btq0ae3atZs2bfroo49GR0c/88wzx48fv3Tp0uLi4vr6+ra2trNnzy4vL+/du3dYWNjjjz/+5Zdf5uXlfeCBB1588cXVq1dv2bLl0KFDX3rpJTc3t5CQEACzZ8+ePn36zTff3NjYOGnSJD8/v8WLF5944omZmZm+vj5vb+99+/bt2rXr0KFD/fr1W1tba2lpOXbs2NSpU//+979funRpwmx2/z+o8p4m337/XAAAAABJRU5ErkJggg==";

type AppState = 'initial' | 'loading' | 'results' | 'error';

const InitialView: React.FC<{ onStart: () => void; isFading: boolean }> = ({ onStart, isFading }) => (
    <div className={`flex flex-col h-full justify-between items-center text-center transition-all duration-500 ${isFading ? 'fade-out' : 'animate-fade-in'}`}>
        <div className="w-full pt-8">
            <div className="bg-white rounded-2xl shadow-lg inline-block p-4">
              <img src={LOGO_BASE64} alt="El Centauro Logo" className="w-64 h-auto" />
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
