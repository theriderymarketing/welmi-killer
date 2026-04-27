# Font assets

Download these and drop them in this folder before running the app.

## Instrument Serif (display, free / SIL OFL)

```
https://fonts.google.com/specimen/Instrument+Serif
```

Files needed:
- `InstrumentSerif-Regular.ttf`
- `InstrumentSerif-Italic.ttf`

## Inter (body, free / SIL OFL)

```
https://fonts.google.com/specimen/Inter
```

Files needed:
- `Inter-Regular.ttf`  (rename from `Inter_18pt-Regular.ttf`)
- `Inter-Medium.ttf`
- `Inter-SemiBold.ttf`
- `Inter-Bold.ttf`

## Auto-fetch script

```bash
cd assets/fonts
curl -L "https://fonts.google.com/download?family=Instrument+Serif" -o is.zip && unzip -j is.zip && rm is.zip
curl -L "https://fonts.google.com/download?family=Inter" -o inter.zip && unzip -j inter.zip "static/Inter-Regular.ttf" "static/Inter-Medium.ttf" "static/Inter-SemiBold.ttf" "static/Inter-Bold.ttf" && rm inter.zip
```
