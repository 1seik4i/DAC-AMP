import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface DriverState {
  connected: boolean;
  firmwareVersion: string;
  sampleRate: number;
  bitDepth: number;
  volume: number;
  gainStage: 'Low' | 'High';
  routing: 'Balanced' | 'Single-Ended';
  temperature: number;
  cpuUsage: number;
  dspUsage: number;
  activeProfileId: string;
  customEq: number[];
}

@Injectable()
export class DriverStateService {
  private readonly logger = new Logger(DriverStateService.name);
  
  private state: DriverState = {
    connected: false,
    firmwareVersion: 'v0.0.0',
    sampleRate: 44100,
    bitDepth: 16,
    volume: 50,
    gainStage: 'Low',
    routing: 'Balanced',
    temperature: 0,
    cpuUsage: 0,
    dspUsage: 0,
    activeProfileId: 'balanced',
    customEq: [0,0,0,0,0,0,0,0,0,0]
  };

  public readonly stateUpdates$ = new Subject<Partial<DriverState>>();

  public getState(): DriverState {
    return { ...this.state };
  }

  public updateState(updates: Partial<DriverState>) {
    let hasChanges = false;
    for (const key of Object.keys(updates) as Array<keyof DriverState>) {
      if (this.state[key] !== updates[key]) {
        // @ts-ignore
        this.state[key] = updates[key];
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      this.stateUpdates$.next(updates);
    }
  }
}
