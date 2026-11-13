import { Injectable, signal } from '@angular/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';

export interface Grabacion {
  id: number;
  fecha: Date;
  duracionMs: number;
  mimeType: string;
  base64: string;
}

@Injectable({ providedIn: 'root' })
export class RecorderService {
  readonly grabando = signal(false);
  readonly grabaciones = signal<Grabacion[]>([]);

  /** Verifica el permiso y, si falta, lo solicita al usuario. */
  async pedirPermiso(): Promise<boolean> {
    const actual = await VoiceRecorder.hasAudioRecordingPermission();
    if (actual.value) {
      return true;
    }
    const respuesta = await VoiceRecorder.requestAudioRecordingPermission();
    return respuesta.value;
  }

  async iniciar(): Promise<void> {
    if (!(await this.pedirPermiso())) {
      throw new Error('PERMISO_DENEGADO');
    }
    await VoiceRecorder.startRecording();
    this.grabando.set(true);
  }

  async detener(): Promise<void> {
    const resultado = await VoiceRecorder.stopRecording();
    this.grabando.set(false);

    const { recordDataBase64, mimeType, msDuration } = resultado.value;
    if (!recordDataBase64) {
      return;
    }

    const nueva: Grabacion = {
      id: Date.now(),
      fecha: new Date(),
      duracionMs: msDuration,
      mimeType,
      base64: recordDataBase64,
    };
    this.grabaciones.update((lista) => [nueva, ...lista]);
  }

  eliminar(id: number): void {
    this.grabaciones.update((lista) => lista.filter((g) => g.id !== id));
  }
}