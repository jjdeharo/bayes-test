# Sistema Adaptativo Bayesiano

Demo educativa de evaluación adaptativa basada en el teorema de Bayes.  
Acceso: **https://jjdeharo.github.io/bayes-test/**

---

## Qué es y para qué sirve

Este programa es una demostración de cómo la inferencia bayesiana puede aplicarse a la evaluación educativa. A diferencia de un test convencional, donde todas las preguntas están fijadas de antemano, este sistema observa cada respuesta del alumno como una evidencia y actualiza en tiempo real su estimación sobre el nivel de conocimiento. A partir de esa estimación, selecciona dinámicamente la siguiente pregunta.

El objetivo pedagógico no es solo calificar al alumno al final, sino ir reduciendo la incertidumbre sobre su nivel a lo largo del propio test, de forma que con pocas preguntas se obtenga una estimación más precisa que con un test lineal más largo.

---

## Fundamentos matemáticos

### El teorema de Bayes

> **En pocas palabras:** el sistema parte de una creencia inicial sobre el nivel del alumno y la corrige tras cada respuesta. Si el alumno acierta algo difícil, la probabilidad de que sea avanzado sube; si falla algo fácil, baja. La fórmula de Bayes es el mecanismo matemático que hace esa corrección de forma rigurosa.

El núcleo del sistema es el teorema de Bayes:

$$P(H \mid E) = \frac{P(E \mid H) \cdot P(H)}{P(E)}$$

Donde:

- $H$ es una hipótesis sobre el nivel del alumno (Básico, Medio o Avanzado)
- $E$ es la evidencia observada (respuesta correcta o incorrecta)
- $P(H)$ es la probabilidad **prior**: lo que el sistema cree antes de ver la respuesta
- $P(E \mid H)$ es la **verosimilitud**: la probabilidad de obtener esa respuesta si el alumno tuviera el nivel $H$
- $P(H \mid E)$ es la probabilidad **posterior**: la creencia actualizada tras observar la respuesta

En la práctica se trabaja con tres hipótesis simultáneas y el denominador $P(E)$ se obtiene por normalización:

$$P(H_i \mid E) = \frac{P(E \mid H_i) \cdot P(H_i)}{\displaystyle\sum_{j} P(E \mid H_j) \cdot P(H_j)}$$

### El prior inicial

> **En pocas palabras:** al comenzar, el sistema no sabe nada del alumno y trata los tres niveles como igualmente probables. Es un punto de partida neutral.

Al comenzar el test, el sistema no tiene ninguna información sobre el alumno. Se asigna una distribución uniforme:

$$P(\text{Básico}) = P(\text{Medio}) = P(\text{Avanzado}) = \frac{1}{3} \approx 33\%$$

Este prior expresa ignorancia total: las tres hipótesis son igualmente plausibles.

### La función de verosimilitud

> **En pocas palabras:** esta tabla recoge cuánto se espera que acierte cada tipo de alumno según la dificultad de la pregunta. Es la pieza clave que da al sistema su capacidad de discriminar niveles.

Cada pregunta tiene asignado un nivel de dificultad (fácil, media o difícil). La verosimilitud recoge la probabilidad de que un alumno de cada nivel responda correctamente:

|                  | Nivel Básico | Nivel Medio | Nivel Avanzado |
|------------------|:------------:|:-----------:|:--------------:|
| Pregunta fácil   |    85 %      |    93 %     |     98 %       |
| Pregunta media   |    35 %      |    65 %     |     88 %       |
| Pregunta difícil |    10 %      |    30 %     |     70 %       |

Estos valores reflejan el supuesto de que las preguntas están bien calibradas: una pregunta difícil discrimina entre niveles medios y avanzados, mientras que una pregunta fácil apenas aporta información sobre los niveles superiores (casi todos aciertan).

Si la respuesta es **incorrecta**, la verosimilitud usada es el complementario: $1 - P(E \mid H)$.

### La actualización bayesiana paso a paso

> **En pocas palabras:** este ejemplo muestra cómo un solo fallo en una pregunta media es suficiente para que el sistema pase de no saber nada (33 % para cada nivel) a estimar con un 58 % de confianza que el alumno es de nivel Básico.

Supongamos que el sistema parte del prior uniforme y el alumno falla una pregunta media. La actualización sería:

**Verosimilitudes del fallo en pregunta media:**

$$P(\text{fallo} \mid \text{media}, \text{Básico}) = 1 - 0{,}35 = 0{,}65$$

$$P(\text{fallo} \mid \text{media}, \text{Medio}) = 1 - 0{,}65 = 0{,}35$$

$$P(\text{fallo} \mid \text{media}, \text{Avanzado}) = 1 - 0{,}88 = 0{,}12$$

**Productos con el prior** $\left(\frac{1}{3}\right)$:

$$\text{Básico:} \quad 0{,}65 \times \tfrac{1}{3} = 0{,}2167 \qquad \text{Medio:} \quad 0{,}35 \times \tfrac{1}{3} = 0{,}1167 \qquad \text{Avanzado:} \quad 0{,}12 \times \tfrac{1}{3} = 0{,}0400$$

**Normalización** — suma total: $0{,}2167 + 0{,}1167 + 0{,}0400 = 0{,}3734$

**Posterior:**

$$P(\text{Básico} \mid \text{fallo media}) = \frac{0{,}2167}{0{,}3734} \approx 58\%$$

$$P(\text{Medio} \mid \text{fallo media}) = \frac{0{,}1167}{0{,}3734} \approx 31\%$$

$$P(\text{Avanzado} \mid \text{fallo media}) = \frac{0{,}0400}{0{,}3734} \approx 11\%$$

Tras un solo fallo en una pregunta media, el sistema ya estima con un 58 % de confianza que el alumno es de nivel Básico. Este posterior se convierte en el prior de la siguiente pregunta, y así sucesivamente.

### Convergencia

> **En pocas palabras:** con cada respuesta, el nivel verdadero del alumno se va haciendo más probable y los demás menos. El sistema no necesita muchas preguntas para llegar a una estimación fiable si las respuestas son consistentes.

La distribución converge porque cada respuesta multiplica las probabilidades por factores distintos para cada nivel. Con respuestas consistentes, la hipótesis verdadera acumula multiplicaciones favorables y las demás se atenúan.

---

## Selección adaptativa de preguntas

### Criterio de dificultad

> **En pocas palabras:** el sistema siempre envía preguntas acordes con el nivel que estima en ese momento. Si cree que el alumno es avanzado, le manda preguntas difíciles; si cree que es básico, fáciles. Esto maximiza la información que obtiene de cada respuesta.

El sistema mapea el nivel estimado (el de mayor probabilidad posterior) con la dificultad objetivo de la siguiente pregunta:

| Nivel estimado | Dificultad objetivo |
|:--------------:|:-------------------:|
| Básico         | Fácil               |
| Medio          | Media               |
| Avanzado       | Difícil             |

Si no quedan preguntas disponibles en la dificultad objetivo, el sistema busca en dificultades adyacentes.

### Condición de parada basada en incertidumbre

> **En pocas palabras:** el test no termina después de un número fijo de preguntas, sino cuando el sistema considera que ya sabe con suficiente seguridad cuál es el nivel del alumno. Esa seguridad se mide con una cantidad llamada *entropía*: cuando la incertidumbre es pequeña, el test concluye. Un alumno con un nivel muy claro puede terminar en 6 preguntas; uno con respuestas inconsistentes necesitará más.

El test no tiene un número fijo de preguntas. La condición de parada se define en términos de la **entropía de Shannon** de la distribución posterior, que mide la incertidumbre que le queda al sistema:

$$H(\pi) = -\sum_{i} \pi_i \log_2 \pi_i$$

El test finaliza cuando se cumple **cualquiera** de estas condiciones:

1. $H(\pi) < H_{\text{stop}}$, con un mínimo de **6 preguntas** para evitar conclusiones prematuras.
2. Se alcanza el tope $MAX\_Q$, calculado automáticamente.

**Entropía inicial** — prior uniforme sobre 3 niveles:

$$H_0 = \log_2 3 \approx 1{,}585 \text{ bits}$$

**Umbral de parada** — se elige como la entropía de la distribución menos concentrada que aún tiene el 80 % de masa en un solo nivel, es decir $[0{,}80,\, 0{,}10,\, 0{,}10]$:

$$H_{\text{stop}} = -(0{,}80\log_2 0{,}80 + 0{,}10\log_2 0{,}10 + 0{,}10\log_2 0{,}10) \approx 0{,}922 \text{ bits}$$

**Número máximo de preguntas** — se deriva mediante una búsqueda minimax sobre el árbol completo de respuestas posibles: en cada nodo se elige la respuesta que maximiza la entropía residual (peor caso para el alumno), y se busca la profundidad máxima antes de que $H < H_{\text{stop}}$. El resultado garantiza que el test termina en a lo sumo $MAX\_Q$ preguntas sea cual sea la secuencia de respuestas.

Esta derivación tiene una consecuencia importante: un alumno que solo acierta preguntas fáciles tarda más en terminar, porque las preguntas fáciles tienen verosimilitudes muy próximas entre sí ($0{,}85$, $0{,}93$, $0{,}98$) y apenas reducen la entropía. Un alumno claramente avanzado, en cambio, puede terminar en pocas preguntas si acierta varias difíciles seguidas.

La barra de progreso refleja la **reducción relativa de entropía** hacia $H_{\text{stop}}$:

$$\text{progreso} = \frac{H_0 - H(\pi)}{H_0 - H_{\text{stop}}}$$

y la nota inferior muestra los bits de incertidumbre actuales frente al objetivo.

### Mecanismo de recuperación

> **En pocas palabras:** un alumno que falla la primera pregunta media recibe preguntas fáciles, pero si las acierta repetidamente el sistema no sabe si es realmente básico o simplemente tuvo mala suerte al principio. Tras 2 aciertos seguidos en fáciles, se inserta una pregunta media para aclarar la duda. Los fallos en fáciles no necesitan este sondeo: ya confirman el nivel básico por sí solos.

Las preguntas fáciles aportan poca información discriminatoria. Un alumno que falle la primera pregunta media puede quedar atrapado recibiendo solo preguntas fáciles, sin posibilidad real de que la distribución se desplace hacia niveles superiores.

Para evitarlo, el sistema cuenta las preguntas fáciles **acertadas consecutivamente**. Tras **2 aciertos seguidos en fáciles**, fuerza automáticamente una pregunta de dificultad media como sondeo de recuperación:

- Si el alumno la **acierta**, la distribución posterior se desplaza hacia Medio o Avanzado y el sistema puede volver a asignar preguntas más difíciles.
- Si la **falla**, el contador se reinicia y el ciclo se repite.

Un fallo en una pregunta fácil no activa el sondeo porque ya aporta evidencia directa a favor de Básico, reduciendo la entropía por sí solo sin necesidad de una pregunta adicional. Este mecanismo preserva la lógica bayesiana: la pregunta media no altera el prior artificialmente, simplemente proporciona evidencia más discriminatoria en el momento oportuno.

### Criterio de categoría

Cuando hay varias preguntas candidatas en la dificultad correcta, el sistema prefiere las categorías menos representadas en el historial de la sesión. Esto garantiza que el test cubra distintas áreas temáticas en lugar de concentrarse en una sola.

### Aleatorización

Antes de aplicar el criterio de categoría, el conjunto de candidatas se mezcla aleatoriamente. Esto rompe el orden fijo del banco de preguntas y hace que cada sesión produzca una secuencia diferente, incluso para alumnos con el mismo nivel.

---

## Banco de preguntas

El banco contiene **90 preguntas** de cultura general, repartidas equitativamente:

- 30 preguntas de dificultad **fácil**
- 30 preguntas de dificultad **media**
- 30 preguntas de dificultad **difícil**

Las categorías incluyen: Geografía, Historia, Ciencia, Arte, Literatura, Filosofía, Matemáticas, Cultura y Deportes. Las preguntas están diseñadas para ser accesibles a cualquier persona con educación general independientemente de su país de origen, evitando referencias a conocimientos específicos de una sola nación.

Cada sesión utiliza entre 6 y $MAX\_Q$ preguntas, seleccionadas adaptativamente. La combinación de 90 preguntas disponibles, selección aleatoria y adaptación al nivel hace que dos sesiones rara vez compartan la misma secuencia.

Las preguntas están definidas en el archivo `questions.js`, separado de la lógica del sistema, lo que facilita ampliar o modificar el banco sin tocar el algoritmo.

---

## Por qué este enfoque es pedagógicamente relevante

**Eficiencia:** un test adaptativo necesita menos preguntas que un test lineal para alcanzar la misma precisión diagnóstica, porque evita hacer preguntas demasiado fáciles o demasiado difíciles para el nivel real del alumno.

**Transparencia:** el sistema muestra en tiempo real la distribución de probabilidad actualizada tras cada respuesta. El alumno o el docente pueden observar cómo la evidencia va modificando la estimación, lo que convierte el test en una herramienta de comprensión del propio proceso de evaluación.

**Ausencia de umbral fijo:** a diferencia de los tests clásicos donde se establece un porcentaje de corte arbitrario, aquí el nivel se estima como una distribución continua. Un alumno no es simplemente "aprobado" o "suspenso": el sistema expresa su confianza en cada hipótesis, lo que proporciona una imagen más matizada del conocimiento.

**Escalabilidad conceptual:** aunque esta demo trabaja con tres niveles, el mismo esquema se puede extender a más niveles, a la detección de errores conceptuales específicos o a múltiples dimensiones de conocimiento simultáneas, simplemente ampliando el espacio de hipótesis y la función de verosimilitud.

---

## Estructura del proyecto

```
bayes-test/
├── index.html       Interfaz y lógica del sistema bayesiano
├── questions.js     Banco de 90 preguntas
└── README.md        Este documento
```

---

## Autor

Juan José de Haro · [bilateria.org](https://bilateria.org)
