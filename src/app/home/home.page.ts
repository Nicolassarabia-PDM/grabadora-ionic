import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonNote, ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mic, stop, play, pause, trash } from 'ionicons/icons';
import { Grabacion, RecorderService } from '../recorder.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  imports: [
    DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonList, IonItem, IonLabel, IonNote,
  ],
})
export class HomePage implements OnDestroy {
  readonly recorder = inject(RecorderService);
  private readonly toast = inject(ToastController);

  readonly segundos = signal(0);
  readonly reproduciendoId = signal<number | null>(null);

  private temporizador?: ReturnType<typeof setInterval>;
  private audio?: HTMLAudioElement;

  constructor() {
    addIcons({ mic, stop, play, pause, trash });
  }

  async alternarGrabacion(): Promise<void> {
    try {
      if (this.recorder.grabando()) {
        clearInterval(this.temporizador);
        await this.recorder.detener();
      } else {
        this.detenerReproduccion();
        await this.recorder.iniciar();
        this.segundos.set(0);
        this.temporizador = setInterval(
          () => this.segundos.update((s) => s + 1),
          1000,
        );
      }
    } catch (error) {
      clearInterval(this.temporizador);
      this.recorder.grabando.set(false);
      const mensaje =
        (error as Error).message === 'PERMISO_DENEGADO'
          ? 'Necesito permiso de micrófono para grabar.'
          : 'No se pudo grabar: ' + (error as Error).message;
      await this.avisar(mensaje);
    }
  }

  async reproducir(g: Grabacion): Promise<void> {
    // Si ya se estaba reproduciendo esta grabación, la pausa.
    if (this.reproduciendoId() === g.id) {
      this.detenerReproduccion();
      return;
    }
    this.detenerReproduccion();

    this.audio = new Audio(`data:${g.mimeType};base64,${g.base64}`);
    this.audio.onended = () => this.reproduciendoId.set(null);
    this.reproduciendoId.set(g.id);
    try {
      await this.audio.play();
    } catch {
      this.reproduciendoId.set(null);
      await this.avisar('No se pudo reproducir el audio.');
    }
  }

  eliminar(g: Grabacion): void {
    if (this.reproduciendoId() === g.id) {
      this.detenerReproduccion();
    }
    this.recorder.eliminar(g.id);
  }

  formatear(ms: number): string {
    const total = Math.round(ms / 1000);
    const min = Math.floor(total / 60);
    const seg = (total % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  }

  private detenerReproduccion(): void {
    this.audio?.pause();
    this.audio = undefined;
    this.reproduciendoId.set(null);
  }

  private async avisar(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 3000 });
    await t.present();
  }

  ngOnDestroy(): void {
    clearInterval(this.temporizador);
    this.detenerReproduccion();
  }
}