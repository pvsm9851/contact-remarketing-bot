import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface MessageIntervalConfigProps {
  intervalSeconds: number;
  setIntervalSeconds: (value: number) => void;
  selectedContactsCount: number;
}

const INTERVAL_PRESETS = [
  { label: 'Rápido', value: 10, description: 'Maior risco de bloqueio' },
  { label: 'Normal', value: 30, description: 'Balanceado' },
  { label: 'Seguro', value: 60, description: 'Recomendado para grandes listas' },
  { label: 'Ultra Seguro', value: 120, description: 'Mínimo risco de bloqueio' },
];

const MessageIntervalConfig: React.FC<MessageIntervalConfigProps> = ({
  intervalSeconds,
  setIntervalSeconds,
  selectedContactsCount,
}) => {
  // Calcula o tempo total estimado
  const calculateTotalTime = () => {
    const totalSeconds = intervalSeconds * (selectedContactsCount - 1);
    if (totalSeconds < 60) {
      return `${totalSeconds} segundos`;
    } else if (totalSeconds < 3600) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes} minuto${minutes > 1 ? 's' : ''}${seconds > 0 ? ` e ${seconds} segundo${seconds > 1 ? 's' : ''}` : ''}`;
    } else {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours} hora${hours > 1 ? 's' : ''}${minutes > 0 ? ` e ${minutes} minuto${minutes > 1 ? 's' : ''}` : ''}`;
    }
  };

  // Determina o nível de risco baseado no intervalo
  const getRiskLevel = () => {
    if (intervalSeconds < 20) return { level: 'Alto', color: 'text-red-400' };
    if (intervalSeconds < 45) return { level: 'Moderado', color: 'text-yellow-400' };
    if (intervalSeconds < 90) return { level: 'Baixo', color: 'text-green-400' };
    return { level: 'Mínimo', color: 'text-blue-400' };
  };

  const risk = getRiskLevel();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="interval">Intervalo entre mensagens</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Configure o intervalo entre o envio de cada mensagem. Um intervalo maior reduz o risco de bloqueio e simula um comportamento mais natural.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="interval"
            type="number"
            min={10}
            max={300}
            value={intervalSeconds}
            onChange={(e) => setIntervalSeconds(Number(e.target.value))}
            className="w-20 bg-gray-900 border-gray-700 text-gray-100"
          />
          <span className="text-sm text-gray-400">segundos</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {INTERVAL_PRESETS.map((preset) => (
            <TooltipProvider key={preset.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={intervalSeconds === preset.value ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setIntervalSeconds(preset.value)}
                    className={`border-gray-700 ${
                      intervalSeconds === preset.value 
                        ? 'bg-gray-700 text-gray-100' 
                        : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {preset.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{preset.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <div className="space-y-2">
          <Slider
            value={[intervalSeconds]}
            min={10}
            max={300}
            step={5}
            onValueChange={(value) => setIntervalSeconds(value[0])}
            className="py-4"
          />

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">10s (min)</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Nível de risco:</span>
              <span className={risk.color}>{risk.level}</span>
            </div>
            <span className="text-gray-500">300s (max)</span>
          </div>
        </div>
      </div>

      {selectedContactsCount > 1 && (
        <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Tempo total estimado</h4>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Para {selectedContactsCount} contatos
            </div>
            <div className="text-sm font-medium text-blue-400">
              {calculateTotalTime()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageIntervalConfig; 