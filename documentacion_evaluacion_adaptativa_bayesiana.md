# Protocolo para generar sistemas educativos adaptativos bayesianos

## Instrucción de uso

Para generar un recurso educativo adaptativo bayesiano con IA, adjunta este documento a cualquier modelo de IA y usa el siguiente prompt:

> Lee el documento adjunto e implementa el sistema siguiendo las instrucciones que contiene.

El modelo pedirá al docente la información necesaria antes de diseñar nada. Si quieres anticiparla, el docente puede rellenar la siguiente plantilla y adjuntarla junto con el documento:

**Tema:**  
**Curso o edad:**  
**Objetivo de aprendizaje:**  
**Número de niveles o hipótesis:**  
**Tipo de recurso adaptativo:** evaluación diagnóstica · evaluación formativa · práctica graduada · actividad de refuerzo · actividad de ampliación · itinerario de aprendizaje · tutorial interactivo · simulador · laboratorio virtual · juego educativo · recomendador de recursos · repaso espaciado · otro  
**Finalidad principal:** detectar nivel de dominio · identificar errores conceptuales · reforzar dificultades · practicar procedimientos · consolidar contenidos · ampliar conocimientos · guiar un itinerario · ofrecer pistas graduadas · personalizar explicaciones · recomendar recursos · preparar una evaluación · repasar contenidos anteriores  
**Qué debe adaptar el sistema:** la siguiente pregunta · la dificultad · el tipo de actividad · la explicación · la cantidad de ayuda · las pistas · el ritmo · el itinerario · el recurso recomendado · el nivel de reto · el momento de finalizar  
**Tipo de respuesta o interacción del alumno:** opción múltiple · verdadero/falso · selección múltiple · emparejamiento · ordenación · respuesta numérica · respuesta breve exacta · elección de ruta · manipulación de variables · interacción con simulador · selección de pistas · resolución paso a paso  
**Tipo de salida esperada:** diagnóstico pedagógico · recomendación de refuerzo · recomendación de ampliación · informe de progreso · explicación personalizada · ruta de aprendizaje · secuencia de práctica · resumen de errores frecuentes · propuesta de siguiente actividad  
**Tipos de preguntas o interacciones permitidas:**  
**Número aproximado de preguntas o pasos:**  
**Duración máxima:**  
**Formato deseado:**  
**Grado de precisión deseado:**  
**Observaciones sobre el alumnado:**  

Las instrucciones técnicas y pedagógicas completas que el modelo leerá e implementará son las siguientes:

> Actúa como diseñador e implementador de sistemas educativos adaptativos bayesianos. Tu tarea es crear un recurso educativo adaptativo como página web estática (HTML + CSS + JavaScript en un único archivo autocontenido), siguiendo exactamente las especificaciones técnicas y pedagógicas de este documento.
>
> **0. Lo primero que debes hacer.**
> Antes de implementar nada, pregunta al docente lo siguiente. No resumas el documento. No preguntes sobre lenguajes ni entornos: el resultado será siempre una página web estática en un único archivo HTML. Haz estas preguntas y espera las respuestas antes de escribir ningún código:
>
> — ¿Sobre qué tema o unidad didáctica quieres el recurso?
> — ¿A qué curso o edad va dirigido?
> — ¿Cuál es el objetivo de aprendizaje?
> — ¿Qué tipo de recurso quieres? (evaluación diagnóstica, práctica graduada, actividad de refuerzo, actividad de ampliación, itinerario de aprendizaje, tutorial, simulador, juego educativo, repaso espaciado u otro)
> — ¿Cuál es la finalidad principal? (detectar nivel, identificar errores, reforzar, practicar, consolidar, ampliar, guiar un itinerario, ofrecer pistas, personalizar explicaciones, recomendar recursos, repasar…)
> — ¿Cuántos niveles o hipótesis quieres? (por defecto: 3 niveles — básico, medio, avanzado)
> — ¿Qué tipo de interacción tendrá el alumno? (opción múltiple, verdadero/falso, emparejamiento, ordenación, respuesta numérica, respuesta breve…)
> — ¿Cuántas preguntas o pasos aproximadamente?
> — ¿Qué resultado o salida debe ver el alumno al final? (diagnóstico, informe de progreso, recomendación, ruta de aprendizaje, propuesta de siguiente actividad…)
> — ¿Alguna observación sobre el alumnado o el contexto?
>
> Solo cuando tengas estas respuestas, diseña e implementa el recurso completo como página web estática.
>
> **1. Estado del alumno.**
> Representa el estado del alumno como un vector de probabilidades P(H_i) sobre n hipótesis de aprendizaje (niveles de dominio, errores conceptuales, lagunas, necesidades de refuerzo u otras hipótesis pedagógicas pertinentes). Inicializa con distribución uniforme P(H_i) = 1/n si no hay información previa. Asigna a cada hipótesis un valor numérico θ_i que refleje su posición relativa en la escala de dominio.
>
> **2. Actualización bayesiana.**
> Tras cada respuesta R del alumno, actualiza la distribución mediante:
> P(H_i | R) = P(R | H_i) · P(H_i) / Σ_j [P(R | H_j) · P(H_j)]
> Normaliza siempre dividiendo por la suma. Repite tras cada respuesta.
>
> **3. Verosimilitudes por pregunta.**
> Calcula P(acierto | H_i, q) dinámicamente para cada pregunta q usando la función logística IRT 3PL:
> P(acierto | H_i, q) = c_q + (1 − c_q) · 1 / (1 + exp(−a · (θ_i − b_q)))
> donde:
> — θ_i es el valor numérico de la hipótesis H_i;
> — b_q es la dificultad de la pregunta (en la misma escala que θ_i);
> — a es el parámetro de discriminación; usa 1.5 por defecto salvo indicación contraria;
> — c_q = 1/m_q es la probabilidad mínima de acierto por azar, siendo m_q el número de opciones de la pregunta (0 si no hay azar).
> P(fallo | H_i, q) = 1 − P(acierto | H_i, q).
> No uses tablas fijas de verosimilitudes. Cada pregunta genera las suyas a partir de sus parámetros.
>
> **4. Selección de la siguiente pregunta.**
> Para cada pregunta disponible q, calcula la ganancia esperada de información:
> P(A) = Σ_i P(H_i) · P(acierto | H_i, q)
> P(F) = 1 − P(A)
> P(H_i | acierto) = P(acierto | H_i, q) · P(H_i) / P(A)
> P(H_i | fallo) = P(fallo | H_i, q) · P(H_i) / P(F)
> IG(q) = H_actual − [P(A) · H(posterior_acierto) + P(F) · H(posterior_fallo)]
> donde H = −Σ p_i · log2(p_i) es la entropía de Shannon.
> Selecciona la pregunta con mayor IG. Entre candidatas con IG prácticamente igual, elige al azar con peso inversamente proporcional al número de veces que su categoría o concepto ha aparecido (diversidad de contenidos). No uses selección determinista entre empates: produce test repetitivos.
>
> **5. Criterio de parada.**
> Detén el test cuando la entropía H caiga por debajo del umbral:
> H_stop = −p_min · log2(p_min) − (1 − p_min) · log2((1 − p_min) / (n − 1))
> donde p_min es el nivel de confianza deseado (0.80 es un valor habitual) y n es el número de hipótesis. Este umbral aproxima la situación en la que la hipótesis más probable supera p_min, suponiendo que la probabilidad restante se reparte de forma uniforme entre las demás hipótesis. En la práctica, conviene comprobar ambos criterios de forma complementaria: que la entropía esté por debajo de H_stop y que la hipótesis más probable supere p_min. Impón también un límite máximo de preguntas y detén el test si no quedan preguntas útiles disponibles. Respeta siempre un mínimo de preguntas antes de poder finalizar.
>
> **6. Recuperación automática.**
> Si se usa actualización bayesiana y selección por máxima ganancia esperada de información, la recuperación queda en gran parte integrada en el mecanismo adaptativo: el sistema favorece automáticamente preguntas más informativas a medida que el posterior cambia. Aun así, el sistema debe evitar bloqueos prácticos mediante un límite máximo de preguntas, variedad suficiente de preguntas por nivel, y la posibilidad de revisar hipótesis si aparecen evidencias contrarias. La recuperación completa no está garantizada si las preguntas están mal calibradas, si hay pocas disponibles en algún nivel, o si el alumno responde al azar.
>
> **7. Preguntas.**
> Usa solo preguntas autocorregibles (opción múltiple, verdadero/falso, numérica con tolerancia, respuesta breve exacta, emparejamiento, ordenación). No incluyas preguntas abiertas largas si no existe corrección automática fiable. Asigna a cada pregunta: texto, dificultad b_q (valor numérico centrado en cero), número de opciones m_q, y categoría o concepto evaluado. Cuando el docente exprese la dificultad de forma cualitativa, conviértela a valores numéricos centrados en cero con intervalos iguales: 2 categorías → (−0.5, 0.5); 3 → (−1, 0, 1); 4 → (−1.5, −0.5, 0.5, 1.5); 5 → (−2, −1, 0, 1, 2). Para los valores θ_i de los niveles o hipótesis jerárquicas, usa la misma convención de centrado e intervalos iguales, pero con un rango el doble de amplio: θ_max = 2 · b_max. Esto es obligatorio: si θ_max = b_max, el nivel extremo y la dificultad extrema coinciden en el punto de inflexión logístico y el sistema nunca selecciona las preguntas de ese extremo. La forma más robusta es calcular θ_max automáticamente como 2 · max|b_q| a partir del banco de preguntas. Si las hipótesis no son jerárquicas (por ejemplo, distintos errores conceptuales), no uses la función logística: define las verosimilitudes directamente según la relación diagnóstica entre cada pregunta y cada hipótesis.
>
> **8. Resultado final.**
> Presenta una interpretación pedagógica: qué domina el alumno, qué dificultades muestra, qué lagunas conviene revisar, qué se recomienda como siguiente paso. Muestra el nivel de confianza de la estimación (probabilidad de la hipótesis más probable). Si la entropía final supera H_stop, indica explícitamente que el diagnóstico es provisional. No te limites a mostrar una puntuación o etiqueta.
>
> **9. Adaptación al contexto.**
> Usa las respuestas del docente obtenidas en el paso 0 para adaptar todos los parámetros: θ_i, b_q, n, p_min, número mínimo y máximo de preguntas o pasos, tipo de interacción y tipo de salida. Si el docente no especifica algún parámetro, usa valores razonables por defecto y explícalos brevemente antes de implementar.
>
> **10. Tipo de recurso.**
> El sistema no debe limitarse a crear recursos de evaluación. Puede generar cualquier tipo de recurso educativo adaptativo según la finalidad indicada por el docente: itinerarios de aprendizaje personalizados, explicaciones adaptativas, práctica graduada, actividades de refuerzo o ampliación, tutoriales interactivos, simuladores con ayudas adaptativas, laboratorios virtuales guiados, sistemas de pistas graduadas, retroalimentación personalizada, juegos educativos adaptativos, recomendadores de recursos o actividades de repaso espaciado.
>
> En todos los casos, la adaptación debe responder a la situación del alumno. Si el alumno muestra dominio, el sistema puede avanzar, ampliar o aumentar la complejidad. Si muestra dificultades, puede ofrecer ayuda, explicación, práctica guiada o refuerzo. Si aparecen errores concretos, puede proponer actividades dirigidas a corregirlos.
>
> La finalidad de la adaptación no tiene por qué ser solo estimar un nivel. También puede ser decidir qué explicación mostrar, qué pista ofrecer, qué ejercicio proponer, qué recurso recomendar, qué itinerario seguir o cuándo pasar de refuerzo a ampliación.
>
> Cuando el recurso no sea una evaluación, el sistema debe seguir usando la información obtenida durante la interacción para adaptar la experiencia. Puede mantener hipótesis sobre el estado del alumno, actualizar esas hipótesis con sus respuestas o acciones, medir la incertidumbre cuando sea útil y tomar decisiones pedagógicas en función de esa estimación.
>
> El resultado final debe ajustarse al tipo de recurso: en una evaluación, ofrece un diagnóstico; en una actividad de aprendizaje, indica el recorrido seguido y las ayudas usadas; en una práctica adaptativa, muestra progreso y recomendaciones; en un recurso de refuerzo o ampliación, explica qué contenidos se han trabajado y cuál sería el siguiente paso.

## 1. Finalidad del protocolo

Este documento sirve como guía para crear aplicaciones, actividades o cuestionarios educativos adaptativos basados en inferencia bayesiana y entropía de Shannon.

El objetivo no es crear un test lineal ni una secuencia rígida de preguntas, sino un sistema capaz de adaptar la experiencia del alumno a partir de sus respuestas. Cada respuesta se interpreta como una evidencia que modifica progresivamente una distribución de probabilidades sobre distintas hipótesis educativas.

Estas hipótesis pueden referirse a:

- nivel de dominio conceptual;
- errores probables;
- ideas previas;
- lagunas concretas;
- necesidades de refuerzo;
- preparación para avanzar a un nivel superior.

El sistema debe producir una interpretación pedagógica, no solo una puntuación.

## 2. Principio general

El programa debe usar las respuestas del alumno como evidencias para actualizar hipótesis sobre su situación de aprendizaje.

Cada respuesta debe modificar la estimación del sistema de forma gradual. Una sola respuesta no debe determinar por completo el resultado.

Una respuesta correcta debe aumentar la plausibilidad de ciertas hipótesis y una respuesta incorrecta debe aumentar la plausibilidad de otras, siempre según las verosimilitudes asociadas a cada pregunta.

El sistema debe evitar conclusiones tajantes cuando la incertidumbre siga siendo alta.

## 3. Representación del estado del alumno

El estado del alumno debe representarse como una distribución de probabilidades sobre varias hipótesis.

Por ejemplo, en un sistema sencillo podrían usarse tres hipótesis:

- nivel básico;
- nivel medio;
- nivel avanzado.

Pero el sistema no debe asumir obligatoriamente tres niveles. Debe poder adaptarse a más o menos niveles, según el contexto educativo.

También pueden usarse hipótesis no estrictamente jerárquicas, por ejemplo:

- comprende el concepto;
- confunde dos ideas próximas;
- aplica una regla de forma mecánica;
- tiene una laguna previa;
- necesita refuerzo procedimental;
- puede pasar a una tarea de ampliación.

Al inicio, si no hay información previa del alumno, el sistema puede partir de probabilidades equilibradas. Si hay información previa fiable, puede usar una distribución inicial justificada.

## 4. Actualización bayesiana

El sistema debe actualizar la distribución de probabilidades mediante inferencia bayesiana.

Para cada hipótesis, debe estimarse la probabilidad de observar la respuesta del alumno si esa hipótesis fuera cierta.

Esa probabilidad es la verosimilitud.

Si el alumno acierta una pregunta, el sistema debe usar la probabilidad de acierto bajo cada hipótesis. Si el alumno falla, debe usar la probabilidad de fallo bajo cada hipótesis.

El resultado de cada actualización debe ser una nueva distribución de probabilidades sobre las hipótesis consideradas.

El proceso debe repetirse tras cada respuesta.

## 5. Fórmulas básicas del modelo

Aunque el documento debe seguir siendo comprensible para docentes, conviene incluir las fórmulas esenciales para que la IA implemente el sistema de forma coherente.

### 5.1. Distribución inicial de hipótesis

Si hay \(n\) hipótesis y no existe información previa fiable, puede usarse una distribución uniforme:

\[
P(H_i)=\frac{1}{n}
\]

Donde \(H_i\) representa una hipótesis posible sobre el estado del alumno.

### 5.2. Actualización bayesiana

Después de cada respuesta, la probabilidad de cada hipótesis se actualiza mediante:

\[
P(H_i\mid R)=\frac{P(R\mid H_i)P(H_i)}{P(R)}
\]

El denominador se calcula sumando sobre todas las hipótesis:

\[
P(R)=\sum_i P(R\mid H_i)P(H_i)
\]

Donde \(R\) es la respuesta observada, que puede ser acierto, fallo u otro resultado autocorregible previsto por el sistema.

### 5.3. Verosimilitud de acierto y fallo

Para cada pregunta \(q\) y cada hipótesis \(H_i\), el sistema debe estimar:

\[
P(\text{acierto}\mid H_i,q)
\]

Si el alumno falla, debe usarse:

\[
P(\text{fallo}\mid H_i,q)=1-P(\text{acierto}\mid H_i,q)
\]

Estas probabilidades son las verosimilitudes que alimentan la actualización bayesiana.

### 5.4. Probabilidad mínima de acierto por azar

En preguntas de opción múltiple, la probabilidad mínima de acierto por azar depende del número de opciones de cada pregunta:

\[
c_q=\frac{1}{m_q}
\]

Donde \(c_q\) es la probabilidad de acierto por azar de la pregunta \(q\), y \(m_q\) es el número de opciones de esa pregunta.

Por ejemplo, una pregunta de cuatro opciones tiene:

\[
c_q=\frac{1}{4}=0.25
\]

Esta probabilidad debe pertenecer a cada pregunta, no al test completo.

### 5.5. Generación logística de verosimilitudes

El sistema debe poder generar las verosimilitudes automáticamente. Una opción recomendable es usar una función logística ajustada por azar:

\[
P(\text{acierto}\mid H_i,q)=
c_q+(1-c_q)\cdot
\frac{1}{1+e^{-a(\theta_i-b_q)}}
\]

Donde:

- \(\theta_i\) representa numéricamente la hipótesis o nivel \(H_i\);
- \(b_q\) representa la dificultad de la pregunta \(q\);
- \(a\) controla la sensibilidad o discriminación;
- \(c_q\) es la probabilidad mínima de acierto por azar.

Esta fórmula no sustituye a Bayes. Solo genera las verosimilitudes que Bayes necesita.

El parámetro \(a\) controla la pendiente de la curva logística. Un valor alto hace que la función discrimine más entre hipótesis próximas; un valor bajo produce transiciones más suaves. Los valores habituales en psicometría oscilan entre 0.5 y 2.5. Para sistemas educativos de propósito general, **un valor de 1.0 a 1.5 es un punto de partida razonable**; 1.5 es una buena elección por defecto.

### 5.6. Entropía de Shannon

La incertidumbre del sistema se mide mediante:

\[
H=-\sum_i p_i\log_2(p_i)
\]

Donde \(p_i\) es la probabilidad actual de cada hipótesis.

La entropía máxima, cuando todas las hipótesis son igual de probables, es:

\[
H_{max}=\log_2(n)
\]

Este valor ayuda a ajustar el umbral de parada al número de hipótesis consideradas.

### 5.7. Ganancia esperada de información

Para seleccionar la siguiente pregunta, el sistema puede estimar la reducción esperada de incertidumbre:

\[
IG(q)=H(\text{antes})-
\left[
P(A)H(\text{después de acierto})+
P(F)H(\text{después de fallo})
\right]
\]

Donde \(P(A)\) es la probabilidad total esperada de acierto y \(P(F)\) la probabilidad total esperada de fallo, calculadas mediante la ley de la probabilidad total:

\[
P(A)=\sum_i P(H_i)\cdot P(\text{acierto}\mid H_i,q)
\]

\[
P(F)=1-P(A)
\]

Las distribuciones posteriores al acierto y al fallo se calculan aplicando Bayes antes de obtener la respuesta real:

\[
P(H_i\mid\text{acierto})=
\frac{P(\text{acierto}\mid H_i,q)\,P(H_i)}{P(A)}
\qquad
P(H_i\mid\text{fallo})=
\frac{P(\text{fallo}\mid H_i,q)\,P(H_i)}{P(F)}
\]

Cuando sea posible, la pregunta más útil será la que produzca mayor reducción esperada de entropía.

## 6. Verosimilitudes generadas por el sistema

Las verosimilitudes son el elemento central del sistema.

Para cada pregunta, el sistema debe estimar:

- qué probabilidad tendría de acertarla un alumno situado en cada hipótesis;
- qué probabilidad tendría de fallarla un alumno situado en cada hipótesis.

El docente no debe tener que rellenar manualmente una tabla de probabilidades. Esa tarea debe hacerla el sistema.

El docente solo debería aportar información pedagógica comprensible, como:

- número de niveles o hipótesis;
- dificultad relativa de cada pregunta;
- tipo de pregunta;
- número de opciones, si procede;
- concepto evaluado;
- posible error conceptual asociado.

A partir de esa información, el programa debe generar automáticamente las verosimilitudes. Para ello puede usar un modelo generador, preferiblemente una función logística ajustada por azar, y más adelante puede recalibrar los valores con datos reales si dispone de suficientes respuestas.

Por tanto, el flujo recomendado es:

1. El docente diseña o revisa las preguntas y les asigna dificultad y formato.
2. El sistema calcula automáticamente las probabilidades de acierto y fallo para cada hipótesis.
3. Bayes usa esas probabilidades como verosimilitudes.
4. Si se acumulan datos reales, el sistema puede ajustar sus parámetros para mejorar la calibración.

El criterio docente debe intervenir en la definición de niveles, dificultades, objetivos y conceptos, pero no debe exigir introducir probabilidades numéricas.

## 7. Verosimilitudes dinámicas por pregunta

La aplicación no debe depender de una tabla fija global de verosimilitudes.

Cada pregunta debe poder tener sus propios parámetros, especialmente:

- dificultad estimada;
- tipo de pregunta;
- número de opciones, si procede;
- probabilidad mínima de acierto por azar;
- concepto o habilidad evaluada;
- posible error conceptual asociado.

Esto permite que el sistema funcione con preguntas de distinto tipo dentro de una misma prueba.

Por ejemplo, una prueba puede incluir preguntas de dos opciones, cuatro opciones, cinco opciones, emparejamiento y respuesta numérica. Cada una debe generar sus propias verosimilitudes.

## 8. Dificultad de las preguntas

Cada pregunta debe tener una dificultad estimada.

La dificultad puede expresarse de forma cualitativa, por ejemplo:

- fácil;
- media;
- difícil.

También puede expresarse mediante una escala más flexible, por ejemplo:

- nivel 1, nivel 2, nivel 3, nivel 4;
- valores numéricos internos;
- categorías definidas por el docente.

El sistema no debe asumir que siempre habrá tres dificultades. Debe adaptarse al número de categorías que defina el docente.

La dificultad puede ser definida inicialmente por el profesor con ayuda de la IA. Posteriormente, si se acumulan datos, puede recalibrarse.

Cuando el docente define la dificultad de forma cualitativa, el sistema debe convertirla a valores numéricos para operar con la función logística. Una convención útil es centrar los valores en cero y separarlos por intervalos iguales:

| Categorías de dificultad | Valores numéricos \(b_q\) |
|:---:|:---:|
| 2 | −0.5 · · 0.5 |
| 3 | −1 · · 0 · · 1 |
| 4 | −1.5 · · −0.5 · · 0.5 · · 1.5 |
| 5 | −2 · · −1 · · 0 · · 1 · · 2 |

Los valores numéricos \(\theta_i\) de los niveles o hipótesis jerárquicas siguen la misma convención de centrado en cero con intervalos iguales, **pero deben abarcar un rango estrictamente mayor que el de \(b_q\)**. Esta condición es crítica: si \(\theta_{\max} = b_{\max}\), el nivel extremo y la dificultad extrema coinciden en el punto de inflexión de la curva logística, donde la ganancia de información es mínima, y el algoritmo adaptativo nunca selecciona las preguntas de ese extremo de dificultad. Un factor de 2 funciona bien en la práctica: \(|\theta_{\max}| = 2 \cdot |b_{\max}|\). Por ejemplo, con 3 dificultades \(b \in \{-1, 0, +1\}\) y 3 niveles, usar \(\theta \in \{-2, 0, +2\}\) garantiza que las preguntas difíciles sean informativas para los alumnos avanzados. Lo más robusto es calcular \(\theta\) automáticamente a partir del banco de preguntas: \(\theta_{\max} = 2 \cdot \max|b_q|\).

## 9. Número variable de niveles e hipótesis

El sistema debe admitir distintos números de hipótesis.

Algunos ejemplos posibles:

- dos estados: domina / no domina;
- tres niveles: básico / medio / avanzado;
- cuatro niveles: inicial / básico / competente / avanzado;
- hipótesis conceptuales: error A / error B / dominio parcial / dominio completo;
- hipótesis por necesidades: refuerzo previo / práctica guiada / consolidación / ampliación.

El umbral de entropía y los criterios de parada deben adaptarse al número de hipótesis consideradas. No debe usarse el mismo umbral para todos los diseños sin justificación.

Si se desea parar cuando la hipótesis más probable supera un nivel de confianza \(p_{\min}\) (por ejemplo, 0.80), el umbral de entropía equivalente es:

\[
H_{\text{stop}}=
-p_{\min}\log_2 p_{\min}
-(1-p_{\min})\log_2\!\left(\frac{1-p_{\min}}{n-1}\right)
\]

Esta fórmula supone que la probabilidad restante se reparte uniformemente entre las otras \(n-1\) hipótesis. Algunos valores orientativos con \(p_{\min}=0.80\):

| Hipótesis \(n\) | \(H_{\text{stop}}\) (bits) |
|:---:|:---:|
| 2 | 0.72 |
| 3 | 0.92 |
| 4 | 1.06 |
| 5 | 1.16 |

La fórmula anterior supone que la probabilidad restante se reparte uniformemente entre las otras \(n-1\) hipótesis, lo que no siempre ocurre en distribuciones reales. Por ejemplo, con tres hipótesis, las distribuciones (0.80, 0.10, 0.10) y (0.80, 0.19, 0.01) tienen la misma hipótesis máxima pero distinta entropía. Por tanto, el umbral \(H_{\text{stop}}\) debe entenderse como una **aproximación práctica**, no como un equivalente exacto. En la implementación, conviene comprobar ambos criterios de forma complementaria: entropía por debajo del umbral e hipótesis más probable por encima de \(p_{\min}\).

Cuando las hipótesis no son jerárquicas —por ejemplo, distintos errores conceptuales sin relación de orden entre ellos—, la función logística IRT puede no ser el modelo más adecuado, porque asume que existe una escala única de «más o menos nivel». En esos casos conviene definir las verosimilitudes de otra forma: por ejemplo, asignando directamente una probabilidad de acierto alta para las preguntas que diagnostican la hipótesis correcta y una probabilidad más baja para las que la confunden con otras hipótesis. La actualización bayesiana sigue siendo idéntica; solo cambia la forma de generar las verosimilitudes.

## 10. Tipos de preguntas admisibles

Si el sistema debe funcionar de forma automática, debe usar preguntas autocorregibles.

Son adecuados, entre otros, estos formatos:

- opción múltiple con una respuesta correcta;
- verdadero/falso;
- selección múltiple con criterio claro de corrección;
- emparejamiento;
- ordenación;
- respuesta numérica con tolerancia;
- respuesta breve exacta.

No deben incluirse preguntas abiertas largas si el programa no puede corregirlas automáticamente de forma fiable.

Las preguntas abiertas pueden ser útiles en una actividad educativa general, pero no deben formar parte del motor adaptativo automático si no existe un mecanismo fiable de corrección o intervención docente.

## 11. Probabilidad de acierto por azar

En preguntas de opción múltiple, la probabilidad mínima de acierto por azar debe depender del número de opciones de cada pregunta.

Esta probabilidad pertenece a cada ítem, no al test completo.

Ejemplos:

- pregunta de 2 opciones: probabilidad mínima de acierto por azar del 50 %;
- pregunta de 3 opciones: probabilidad mínima de acierto por azar del 33,3 %;
- pregunta de 4 opciones: probabilidad mínima de acierto por azar del 25 %;
- pregunta de 5 opciones: probabilidad mínima de acierto por azar del 20 %.

Si dentro de una misma prueba hay preguntas con distinto número de opciones, cada pregunta debe usar su propia probabilidad mínima de acierto por azar.

En selección múltiple con varias respuestas correctas, la probabilidad de acierto por azar puede ser distinta. El sistema debe tratar este caso de forma específica, especialmente si se exige coincidencia exacta con la combinación correcta.

En respuestas numéricas con tolerancia o respuestas breves exactas, la probabilidad de acierto por azar puede considerarse nula o muy baja, según el diseño.

## 12. Uso de una función logística

Cuando proceda, las verosimilitudes pueden generarse mediante una función logística ajustada por azar.

La idea general es que la probabilidad de acierto debe aumentar cuando el nivel hipotético del alumno supera la dificultad de la pregunta, y debe disminuir cuando la dificultad supera el nivel hipotético del alumno.

Si se usa este modelo, debe respetarse una condición importante: la probabilidad de acierto no debe ser inferior a la probabilidad de acierto por azar propia de la pregunta.

Por tanto, una pregunta de cuatro opciones no debería asignar una probabilidad de acierto inferior al 25 %, porque un alumno que responde al azar tiene esa probabilidad de acertar.

La función logística no sustituye a Bayes. Solo sirve para generar las verosimilitudes que Bayes necesita.

El sistema debe permitir que esta generación sea ajustable. Por ejemplo, puede existir un parámetro de sensibilidad o discriminación que determine cuánto separa una pregunta entre unas hipótesis y otras.

## 13. Selección adaptativa de la siguiente pregunta o actividad

A partir de la estimación actual, el programa debe seleccionar dinámicamente la siguiente pregunta, explicación o actividad.

La selección debe buscar utilidad pedagógica.

Puede servir para:

- confirmar una hipótesis probable;
- distinguir entre hipótesis cercanas;
- detectar un error conceptual;
- comprobar una laguna concreta;
- reforzar una dificultad;
- cubrir un contenido todavía no evaluado;
- permitir que el alumno demuestre un nivel superior;
- decidir si conviene pasar a ampliación o a refuerzo.

El sistema no debe limitarse a subir la dificultad tras un acierto y bajarla tras un fallo.

Debe tener en cuenta:

- historial de respuestas;
- conceptos ya evaluados;
- errores detectados;
- variedad de contenidos;
- dificultad relativa de las preguntas;
- tipo de pregunta;
- número de opciones de cada pregunta;
- probabilidad de acierto por azar;
- grado de seguridad de la estimación actual.

Cuando varias preguntas tienen la misma ganancia de información esperada —lo que ocurre frecuentemente cuando comparten los mismos parámetros de dificultad y número de opciones—, la selección entre ellas no debe ser determinista. Se recomienda una **selección aleatoria ponderada**: calcular la ganancia de todas las candidatas, reunir las que están dentro de un margen mínimo del máximo, y elegir entre ellas con una probabilidad proporcional al inverso de las veces que su categoría o concepto ha aparecido ya. Esto combina máxima utilidad informativa con diversidad temática, sin imponer restricciones rígidas. Una selección determinista entre empates produce test sistemáticamente repetitivos entre distintas sesiones.

## 14. Reducción esperada de incertidumbre

Cuando sea posible, el sistema debe seleccionar la pregunta que más reduzca la incertidumbre esperada.

Para ello debe estimar, antes de presentar la pregunta:

- qué ocurriría si el alumno acierta;
- qué ocurriría si el alumno falla;
- cómo cambiaría la distribución de probabilidades en cada caso;
- qué entropía tendría cada distribución posterior;
- cuál sería la incertidumbre esperada después de formular esa pregunta.

La mejor pregunta no tiene por qué ser la que coincide con el nivel más probable. Puede ser una pregunta que ayude a distinguir entre dos hipótesis todavía plausibles.

Por ejemplo, si el sistema duda entre nivel medio y avanzado, una pregunta difícil puede ser más útil que una pregunta media. Si duda entre básico y medio, una pregunta media o fácil puede ser más informativa, según las verosimilitudes.

## 15. Mecanismos de recuperación

Cuando la selección de preguntas se realiza por máxima ganancia de información esperada, **la recuperación queda en gran parte integrada** en el propio mecanismo bayesiano: si el alumno inicialmente falla pero después responde correctamente preguntas más difíciles, el posterior se desplaza automáticamente y el sistema selecciona preguntas más exigentes. No suele ser necesaria una lógica de recuperación explícita, pero la recuperación completa no está garantizada si las preguntas están mal calibradas, si hay pocas disponibles en algún nivel, o si el alumno responde al azar.

Los mecanismos de recuperación explícitos solo son necesarios cuando la selección de preguntas se basa en reglas simples de dificultad (subir tras acierto, bajar tras fallo), porque en ese caso el sistema puede quedar bloqueado en un nivel incorrecto. Si se usa selección por ganancia de información, ese bloqueo no puede ocurrir.

Lo que sí debe garantizarse en cualquier diseño:

- El sistema no debe encerrar al alumno de forma irreversible en una categoría inicial.
- Si el alumno falla al principio pero después muestra señales consistentes de dominio, el posterior bayesiano se encargará de reflejar ese cambio y el selector elegirá preguntas más informativas para el nivel superior.
- Si el alumno empieza con aciertos pero después muestra errores relevantes, el sistema revisará la distribución de probabilidades y seleccionará preguntas que ayuden a distinguir entre hipótesis todavía plausibles.
- La adaptación debe ser dinámica en cada respuesta, no solo al inicio o al final.

## 16. Entropía de Shannon como medida de incertidumbre

La seguridad razonable debe estimarse mediante la entropía de Shannon aplicada a la distribución de probabilidades de las hipótesis.

Cuando las probabilidades están muy repartidas, la entropía es alta y el sistema tiene mucha incertidumbre.

Cuando una hipótesis concentra la mayor parte de la probabilidad, la entropía es baja y el sistema tiene más seguridad.

La entropía debe servir para:

- decidir si conviene seguir preguntando;
- comparar la incertidumbre antes y después de una pregunta;
- seleccionar preguntas informativas;
- determinar si el diagnóstico final es firme o provisional.

El umbral de parada debe ajustarse al número de hipótesis consideradas y al grado de precisión deseado.

## 17. Criterios de finalización

El proceso debe terminar cuando haya una seguridad razonable sobre el estado de aprendizaje del alumno o cuando se alcance un límite práctico.

Los criterios posibles son:

- **La entropía cae por debajo del umbral \(H_{\text{stop}}\) y la hipótesis más probable supera \(p_{\min}\).** Ambos criterios son complementarios y conviene comprobar los dos: \(H_{\text{stop}}\) se calcula suponiendo distribución uniforme del resto, lo que es una aproximación (véase §9).
- **Se alcanza un número máximo de preguntas.** Conviene distinguir entre un máximo teórico y un máximo práctico. El primero puede estimarse mediante búsqueda minimax sobre el árbol de respuestas posibles; el segundo debe fijarse por usabilidad. En una demo o herramienta educativa breve puede imponerse, por ejemplo, un tope duro de 20 preguntas, mostrando resultado provisional si no se ha convergido antes.
- **La mejor pregunta disponible deja de ser útil.** Si, tras un número suficiente de preguntas, la ganancia esperada de información de la mejor candidata cae por debajo de un umbral mínimo, conviene detener la sesión y devolver un diagnóstico provisional en lugar de alargarla artificialmente.
- Ya se han cubierto los conceptos mínimos previstos.
- No quedan preguntas útiles disponibles.
- El coste de seguir preguntando supera la ganancia pedagógica esperada.

Si la entropía final sigue siendo alta, el sistema debe indicarlo claramente.

En ese caso, el resultado debe presentarse como una estimación provisional, no como una conclusión firme.

## 18. Resultado final

El resultado final debe presentarse como una interpretación pedagógica.

Debe incluir, cuando proceda:

- qué parece dominar el alumno;
- qué dificultades muestra;
- qué errores conceptuales son probables;
- qué lagunas conviene revisar;
- qué tipo de refuerzo se recomienda;
- qué actividad de avance podría proponerse;
- qué grado de seguridad tiene la estimación;
- si el diagnóstico es firme o provisional.

No debe limitarse a mostrar una puntuación o una etiqueta.

La finalidad del sistema es ayudar a tomar decisiones educativas.

## 19. Adaptación al contexto docente

La implementación concreta debe adaptarse al contexto educativo que indique el docente.

Antes de diseñar el sistema, conviene recoger información sobre:

- tema o unidad didáctica;
- edad o curso del alumnado;
- objetivos de aprendizaje;
- número de niveles o hipótesis;
- tipos de preguntas permitidas;
- número aproximado de preguntas;
- duración máxima;
- finalidad de la evaluación;
- formato deseado;
- grado de precisión necesario;
- si se desea diagnóstico, refuerzo, práctica, ampliación o evaluación formativa.

El sistema debe adaptar sus decisiones a ese contexto.

## 20. Plantilla para el docente

La plantilla para que el docente proporcione la información inicial figura en la sección **Instrucción de uso**, al inicio del documento.

## 21. Reglas de diseño para la IA

Al generar una aplicación o actividad basada en este protocolo, la IA debe seguir estas reglas:

1. No crear un recorrido rígido ni un test lineal.
2. No limitarse a subir dificultad tras acierto y bajarla tras fallo.
3. Representar el estado del alumno mediante probabilidades sobre hipótesis.
4. Actualizar esas probabilidades de forma gradual.
5. Generar dinámicamente las verosimilitudes, sin exigir al docente que introduzca tablas de probabilidades.
6. Tener en cuenta la dificultad de cada pregunta.
7. Tener en cuenta el número de opciones de cada pregunta.
8. No usar preguntas abiertas largas si no se pueden corregir automáticamente.
9. Seleccionar preguntas por utilidad pedagógica e información esperada.
10. Usar entropía de Shannon para medir incertidumbre.
11. Permitir recuperación ante estimaciones iniciales equivocadas.
12. Presentar el resultado como interpretación pedagógica.
13. Indicar cuándo la estimación es provisional.
14. Adaptarse al contexto proporcionado por el docente.
15. Evitar detalles técnicos innecesarios si el usuario solo necesita metodología.

## 22. Instrucción maestra portable

La instrucción maestra completa, junto con la plantilla para el docente, figura en la sección **Instrucción de uso**, al inicio del documento.

## 23. Alcance y límites

Este protocolo no sustituye al criterio docente.

El sistema puede ayudar a orientar decisiones, pero sus resultados deben interpretarse con prudencia, especialmente cuando:

- hay pocas preguntas;
- las preguntas no están bien calibradas;
- las verosimilitudes iniciales proceden de un modelo generador no calibrado con datos reales;
- el alumno responde al azar;
- el contexto de aplicación es muy limitado;
- la entropía final sigue siendo alta.

El valor principal del enfoque está en hacer explícita la incertidumbre y en adaptar la actividad a las evidencias disponibles.
