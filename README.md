# Grabadora de audio con Ionic, Angular y Capacitor

App de ejemplo para la materia Dispositivos Móviles: graba y reproduce audio con el micrófono del celular.

**Integrantes:** Cecilia Micaela Estigarribia, Luis Maria Martinez Maya, Augusto Nicolás Sarabia Ramirez

## Tecnologías
- Ionic 9 y Angular 22
- Capacitor 8
- Plugin `capacitor-voice-recorder` y `@capacitor/filesystem`

## Permisos (Android)
`RECORD_AUDIO`, declarado en `android/app/src/main/AndroidManifest.xml` y solicitado al usuario en ejecución.

## Cómo ejecutarla
```bash
npm install
ionic build
npx cap sync android
npx cap open android
```

## APK
El archivo `grabadora.apk` está en la sección **Releases** del repositorio.