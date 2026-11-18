# 🎬 Guion para grabar la demo de Agent Locally

**Duración recomendada: 3 minutos** (máximo 3:30). Si la organización no dice otra cosa, 2-3 minutos es lo habitual en un hackathon: el jurado ve muchos vídeos seguidos y valora que se entienda rápido. Al final hay una **versión corta de 90 segundos** por si os piden menos.

> **Idea central que tiene que quedar clara:** *"No te decimos qué restaurante tiene opciones vegetarianas: te decimos qué plato puede pedir cada persona de tu mesa, y qué decirle al camarero."*

---

## 1. Antes de grabar (15 minutos)

### Credenciales y estado
- [ ] Credenciales de AWS **nuevas**: en la terminal del workshop, `aws configure export-credentials --format env`. Ponlas en **Vercel → Settings → Environment Variables** y haz **Redeploy**.
- [ ] Abre `https://aws-hackathon-wine.vercel.app/api/estado` y comprueba `"todo_ok": true` y `"ia_en_uso": "Claude en Bedrock"`. En el vídeo tiene que responder Bedrock, porque es un hackathon de AWS.

### Material
- [ ] **Una carta impresa o en papel** (de un restaurante real, de casa o impresa de internet) con platos variados. Mejor si tiene alguno con carne en el nombre (alitas, hamburguesa…) y algo con jamón o frutos secos. Que se lea bien: buena luz, sin reflejos.
- [ ] Opcional: una diapositiva con la **arquitectura** (el diagrama del README) y la **tabla de la comparativa de modelos**.

### Móvil
- [ ] Modo **No molestar** activado, batería alta, brillo alto y wifi estable.
- [ ] Safari o Chrome con la web abierta y **sin pestañas privadas** (la app guarda la mesa en el navegador).
- [ ] Grabación de pantalla: iPhone → *Centro de control → Grabar pantalla*. Android → *Ajustes rápidos → Grabar pantalla*.

### Ensayo (imprescindible)
- [ ] Haz **el recorrido completo una vez** antes de grabar, con los mismos datos. Así compruebas que todo responde y la mesa queda guardada en "Perfiles recientes", lo que ahorra tiempo en la toma buena.

---

## 2. Los personajes

Una mesa de 4 amigos que lo dice todo sin explicar nada:

| Comensal | Restricción | Para qué sirve en la demo |
|---|---|---|
| **Ana** | Sin gluten (celíaca) | Alergia grave: rebozados, pan, contaminación cruzada |
| **Bea** | Embarazo | Lo que **ninguna otra app filtra**: huevo poco hecho, quesos crudos, alcohol |
| **Carlos** | Vegetariano | "Pedir sin chorizo": el plato adaptable |
| **Dani** | Sin restricciones | El grupo real: alguien come de todo |

Presupuesto **€€** y preferencias: *"italiano o tapas, nada de picante"*.

---

## 3. Guion (3:00)

Graba **por bloques**, uno por apartado, y únelos al editar. Así, si algo sale mal, solo repites ese bloque.

### 0:00 – 0:20 · El problema
**Pantalla:** inicio de la app (cabecera naranja con el semáforo).

> 🎙️ *"Salir a cenar con una amiga celíaca, otra embarazada y un vegetariano es un problema. Google Maps te dice que un sitio 'tiene opciones sin gluten', pero no qué puede pedir cada uno. Y nadie filtra los riesgos del embarazo. Por eso hemos creado Agent Locally."*

### 0:20 – 1:20 · Modo 1: buscar dónde ir
**Pantalla:** *Buscar restaurante* → configura (o pulsa la mesa de "Perfiles recientes") → *Buscar restaurantes*.

> 🎙️ *"Le decimos quién va: Ana es celíaca, Bea está embarazada, Carlos es vegetariano. Queremos italiano o tapas, sin picante, con presupuesto medio."*

**Mientras el agente trabaja** se ven los pasos en vivo: "Buscando restaurantes… Revisando plato a plato la carta de…".
> 🎙️ *"El agente, con Claude en Amazon Bedrock, busca candidatos, consulta qué eligieron grupos parecidos y revisa cada carta plato a plato para cada persona."*

✂️ **En la edición, acelera esta espera (x4)** o córtala. Tarda unos 20-30 s.

**Resultados:** enseña el resumen del agente y abre **una tarjeta** → *Ver qué puede pedir cada uno*.
- Cambia entre comensales: **Carlos** → 🟡 *"Pedir sin chorizo"*. **Bea** → 🟡 *"Pedir el huevo bien hecho"*. **Ana** → los 🔴 con su motivo.

> 🎙️ *"No solo dice si el sitio vale: dice qué puede pedir cada uno y qué decirle al camarero. Los huevos rotos con chorizo valen para Carlos si los pide sin chorizo; una lasaña boloñesa, no, porque la carne va en la salsa."*

Si aparece **"Revisados y descartados"** (por ejemplo, un italiano al 0 %), menciónalo:
> 🎙️ *"Y si nada encaja al 100 %, no te deja sin respuesta: te explica qué tendrías que ceder."*

Para terminar el bloque: pestaña **Mapa** (pines con el % de encaje) → vuelve a la lista → **Elegimos este sitio** → mensaje verde.
> 🎙️ *"Al confirmar, la elección se guarda: el siguiente grupo con las mismas restricciones verá que otros ya lo eligieron."*

### 1:20 – 2:15 · Modo 2: ya estamos en el restaurante
**Pantalla:** inicio → *Estoy en el restaurante* → *Continuar* → pestaña **📷 Foto** → *Hacer foto* a la carta impresa → *Analizar carta*.

> 🎙️ *"Y si ya estás sentado con la carta delante, le haces una foto."*

✂️ Acelera la espera (unos 30 s).

**Carta semáforo:** selector de comensal arriba y los tres bloques. Busca y enseña:
- Un 🟡 con 💬 instrucción (por ejemplo, *"Pedir sin jamón ibérico"*).
- Un 🔴 evidente: alitas o hamburguesa para Carlos, o un plato con pan para Ana.
- Un plato con **🤖 e "Ingredientes supuestos"**.

> 🎙️ *"Lee la carta, deduce los ingredientes que no aparecen, porque una hamburguesa lleva pan aunque no lo pongan, y le dice a cada uno qué puede pedir. Lo marcado con el robot lo ha valorado la IA, y unas reglas fijas revisan siempre su respuesta para que una alergia no se escape."*

### 2:15 – 2:35 · Búsqueda por significado (opcional, si vas bien de tiempo)
**Pantalla:** *Estoy en el restaurante* → *Buscar local* → escribe **"ramen"**.

> 🎙️ *"Y busca por significado: escribo 'ramen' y encuentra Sushi Kaze por su ramen tonkotsu, aunque la palabra no aparezca en su ficha."*

### 2:35 – 3:00 · Cómo está hecho (AWS) y cierre
**Pantalla:** diapositiva de arquitectura o tabla de modelos.

> 🎙️ *"Por dentro: un agente con cuatro herramientas sobre Amazon Bedrock. Comparamos ocho modelos y elegimos Claude Sonnet 5.5: el doble de rápido que Opus y ningún error peligroso en nuestras pruebas de alergias. Los datos y la búsqueda semántica están en Supabase con pgvector, y si AWS no responde, salta solo a Gemini.*
> *Agent Locally: qué puede comer cada uno de vosotros, plato a plato."*

---

## 4. Versión corta (90 s)

| Tiempo | Qué |
|---|---|
| 0:00-0:10 | El problema (una frase) |
| 0:10-0:50 | Modo 1: mesa de 4 → resultados → abrir una tarjeta (*"sin chorizo"*, *"huevo bien hecho"*) |
| 0:50-1:20 | Modo 2: foto de la carta → semáforo con un 🟡 y un 🔴 |
| 1:20-1:30 | Una frase de arquitectura (Bedrock + Claude Sonnet 5.5 + Supabase) y el lema |

---

## 4b. Versión sin voz (rótulos en pantalla)

Si nadie quiere hablar: música de fondo suave y estos textos sobre la grabación. Son cortos para que dé tiempo a leerlos: cada rótulo debe verse **al menos 3 segundos**. Otra opción es pasar las frases del guion por **CapCut → Texto a voz** (voz en español).

| Momento | Rótulo |
|---|---|
| Inicio | **Celíaca, embarazada y vegetariano en la misma mesa.** |
| | Las apps te dicen *"tiene opciones sin gluten"*. No **qué** puede pedir cada uno. |
| Logo / cabecera | **Agent Locally** · qué puede comer cada uno, plato a plato |
| Configurando la mesa | Un perfil por comensal |
| Agente trabajando | El agente revisa **cada carta, plato a plato** (Claude en Amazon Bedrock) |
| Tarjeta abierta | 🟢 Apto · 🟡 Pidiendo cambios · 🔴 Mejor evitar |
| 🟡 "Pedir sin chorizo" | Te dice **qué decirle al camarero** |
| Mapa | Encaje del grupo y precio de un vistazo |
| "Elegimos este sitio" | Memoria colectiva: ayuda a los próximos grupos |
| Haciendo la foto | ¿Ya estás sentado? **Haz una foto a la carta** |
| Carta semáforo | Deduce lo que la carta no dice: una hamburguesa lleva pan |
| 🤖 en un plato | 🤖 = lo ha valorado la IA · unas reglas fijas revisan cada alergia |
| Buscar "ramen" | Busca por significado, no solo por palabras |
| Arquitectura | Amazon Bedrock · Claude Sonnet 5.5 · Supabase + pgvector · Vercel |
| | 8 modelos comparados · 0 errores peligrosos con alergias |
| Final | **Agent Locally** · Qué puede comer cada uno de vosotros |

Con rótulos el vídeo necesita un poco más de tiempo: cuenta con **3:00-3:30**.

## 5. Consejos de grabación

- **Graba la voz aparte**, en silencio y con el guion delante, y ponla encima del vídeo. Queda mucho mejor que hablar mientras pulsas.
- **Acelera las esperas** del agente y de la foto (x4 o con un corte y un rótulo "30 segundos después…"), pero **no las elimines del todo**: ver los pasos en vivo demuestra que es un agente de verdad.
- **Subtítulos**: muchos jurados ven los vídeos sin sonido. CapCut los genera solos.
- **Formato**: si el vídeo va a una pantalla grande, pon la grabación vertical del móvil dentro de un marco de teléfono sobre fondo naranja (CapCut o Canva lo hacen en un minuto).
- **Datos honestos**: si sale en pantalla, di que los restaurantes de la base de datos son ficticios (la foto de la carta sí es real).

## 6. Plan B

| Si pasa esto… | Haz esto |
|---|---|
| Las credenciales de AWS han caducado | Renuévalas y haz *Redeploy*. Si no da tiempo, la app usa Gemini sola; no digas "Bedrock" en esa toma |
| El agente tarda mucho o falla | Repite solo ese bloque; ten grabada una **toma de reserva** del ensayo |
| La foto se lee mal | Más luz, sin reflejos, foto más cerca; o usa la pestaña **Texto** pegando la carta |
| Algo raro en pantalla | Revisa `/api/estado` y los *Logs* del proyecto en Vercel |
