# Sistema Adaptativo Bayesiano

Demo educativa de evaluación adaptativa basada en el teorema de Bayes y la entropía de Shannon.  
Acceso: **https://jjdeharo.github.io/bayes-test/**

---

## Qué es y para qué sirve

Este programa es una demostración de cómo la inferencia bayesiana y la teoría de la información pueden aplicarse conjuntamente a la evaluación educativa. A diferencia de un test convencional, donde todas las preguntas están fijadas de antemano, este sistema observa cada respuesta del alumno como una evidencia y actualiza en tiempo real su estimación sobre el nivel de conocimiento. A partir de esa estimación, selecciona dinámicamente la siguiente pregunta.

El **teorema de Bayes** es el mecanismo que actualiza las probabilidades tras cada respuesta: combina lo que el sistema ya creía con la nueva evidencia para obtener una estimación revisada. La **entropía de Shannon** mide cuánta incertidumbre queda en esa estimación y determina cuándo el sistema sabe suficiente para detener el test. Ambos conceptos trabajan juntos: Bayes actualiza, Shannon decide cuándo parar.

El objetivo pedagógico no es solo calificar al alumno al final, sino ir reduciendo la incertidumbre sobre su nivel a lo largo del propio test, de forma que con pocas preguntas se obtenga una estimación más precisa que con un test lineal más largo.

---

## Fundamentos matemáticos

### El teorema de Bayes

> **Sin fórmulas:** el sistema parte de una creencia inicial sobre el nivel del alumno y la corrige tras cada respuesta. Si el alumno acierta algo difícil, la probabilidad de que sea avanzado sube; si falla algo fácil, baja. La fórmula de Bayes es el mecanismo matemático que hace esa corrección de forma rigurosa.

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

> **Sin fórmulas:** al comenzar, el sistema no sabe nada del alumno y trata los tres niveles como igualmente probables. Es un punto de partida neutral.

Al comenzar el test, el sistema no tiene ninguna información sobre el alumno. Se asigna una distribución uniforme:

$$P(\text{Básico}) = P(\text{Medio}) = P(\text{Avanzado}) = \frac{1}{3} \approx 33\%$$

Este prior expresa ignorancia total: las tres hipótesis son igualmente plausibles.

### La función de verosimilitud

> **Sin fórmulas:** esta tabla recoge cuánto se espera que acierte cada tipo de alumno según la dificultad de la pregunta. Es la pieza clave que da al sistema su capacidad de discriminar niveles. Los valores incluyen una corrección para tener en cuenta que el alumno puede acertar por azar aunque no sepa la respuesta.

Cada pregunta tiene asignado un nivel de dificultad (fácil, media o difícil). La verosimilitud recoge la probabilidad de que un alumno de cada nivel responda correctamente:

|                  | Nivel Básico | Nivel Medio | Nivel Avanzado |
|------------------|:------------:|:-----------:|:--------------:|
| Pregunta fácil   |   88,75 %    |   94,75 %   |    98,5 %      |
| Pregunta media   |   51,25 %    |   73,75 %   |    91,0 %      |
| Pregunta difícil |   32,5 %     |   47,5 %    |    77,5 %      |

Estos valores se obtienen a partir de una calibración previa (ver sección siguiente) y garantizan que ningún alumno, sea cual sea su nivel, tenga una probabilidad de acierto inferior al 25 % (el suelo del azar con 4 opciones).

Si la respuesta es **incorrecta**, la verosimilitud usada es el complementario: $1 - P(E \mid H)$.

### Corrección por azar — modelo IRT de tres parámetros (3PL)

> **Sin fórmulas:** con 4 opciones, cualquier alumno tiene al menos un 25 % de probabilidad de acertar por pura suerte. Sin corregir esto, el modelo trataría algunos aciertos como evidencia mucho más fuerte de lo que realmente son. La corrección ajusta todos los valores para que el azar quede incorporado en el cálculo.

Con ítems de cuatro opciones la probabilidad mínima teórica de acierto es $G = \tfrac{1}{4}$, incluso para alguien que no sabe nada. El modelo IRT de tres parámetros (3PL) incorpora este suelo mediante la siguiente transformación sobre la probabilidad de conocimiento puro $k$:

$$P(\text{correcto} \mid \text{diff}, \text{nivel}) = G + (1 - G) \cdot k = \frac{1}{4} + \frac{3}{4} \cdot k$$

Los valores de conocimiento puro $k$ (antes de la corrección) son:

|                  | Básico ($k$) | Medio ($k$) | Avanzado ($k$) |
|------------------|:------------:|:-----------:|:--------------:|
| Pregunta fácil   |    0,85      |    0,93     |    0,98        |
| Pregunta media   |    0,35      |    0,65     |    0,88        |
| Pregunta difícil |    0,10      |    0,30     |    0,70        |

Sin esta corrección, el valor Difícil/Básico sería 0,10, por debajo del suelo del azar (0,25), lo que implicaría que un alumno básico acierta preguntas difíciles *menos* que tirando una moneda al azar — un supuesto inconsistente.

La corrección tiene además una consecuencia importante sobre la asimetría informativa: un **fallo** mantiene los mismos ratios de verosimilitud que antes (todos los valores de fallo se multiplican por el mismo factor $\tfrac{3}{4}$, que se cancela en la normalización), mientras que un **acierto** es ahora menos diagnóstico porque siempre puede deberse al azar.

### La actualización bayesiana paso a paso

> **Sin fórmulas:** este ejemplo muestra cómo un solo fallo en una pregunta media es suficiente para que el sistema pase de no saber nada (33 % para cada nivel) a estimar con un 58 % de confianza que el alumno es de nivel Básico. Los fallos son especialmente informativos porque el azar no puede "rescatar" a un alumno que no sabe la respuesta.

Supongamos que el sistema parte del prior uniforme y el alumno falla una pregunta media. Con los valores corregidos por azar ($P(\text{media}) = [0{,}5125,\ 0{,}7375,\ 0{,}91]$), la actualización sería:

**Verosimilitudes del fallo en pregunta media:**

$$P(\text{fallo} \mid \text{media}, \text{Básico}) = 1 - 0{,}5125 = 0{,}4875$$

$$P(\text{fallo} \mid \text{media}, \text{Medio}) = 1 - 0{,}7375 = 0{,}2625$$

$$P(\text{fallo} \mid \text{media}, \text{Avanzado}) = 1 - 0{,}91 = 0{,}09$$

**Productos con el prior** $\left(\frac{1}{3}\right)$:

$$\text{Básico:} \quad 0{,}4875 \times \tfrac{1}{3} = 0{,}1625 \qquad \text{Medio:} \quad 0{,}2625 \times \tfrac{1}{3} = 0{,}0875 \qquad \text{Avanzado:} \quad 0{,}09 \times \tfrac{1}{3} = 0{,}03$$

**Normalización** — suma total: $0{,}1625 + 0{,}0875 + 0{,}03 = 0{,}28$

**Posterior:**

$$P(\text{Básico} \mid \text{fallo media}) = \frac{0{,}1625}{0{,}28} \approx 58\%$$

$$P(\text{Medio} \mid \text{fallo media}) = \frac{0{,}0875}{0{,}28} \approx 31\%$$

$$P(\text{Avanzado} \mid \text{fallo media}) = \frac{0{,}03}{0{,}28} \approx 11\%$$

Tras un solo fallo en una pregunta media, el sistema estima con un 58 % de confianza que el alumno es de nivel Básico. Este posterior se convierte en el prior de la siguiente pregunta, y así sucesivamente. Nótese que los porcentajes son prácticamente idénticos a los que se obtendrían sin la corrección: esto se debe a que, para los **fallos**, la corrección multiplica todos los valores por el mismo factor $\tfrac{3}{4}$, que desaparece en la normalización. La corrección afecta principalmente a los **aciertos**, haciéndolos menos diagnósticos.

### Convergencia

> **Sin fórmulas:** con cada respuesta, el nivel verdadero del alumno se va haciendo más probable y los demás menos. El sistema no necesita muchas preguntas para llegar a una estimación fiable si las respuestas son consistentes.

La distribución converge porque cada respuesta multiplica las probabilidades por factores distintos para cada nivel. Con respuestas consistentes, la hipótesis verdadera acumula multiplicaciones favorables y las demás se atenúan.

---

## Selección adaptativa de preguntas

### Criterio de dificultad

> **Sin fórmulas:** el sistema siempre envía preguntas acordes con el nivel que estima en ese momento. Si cree que el alumno es avanzado, le manda preguntas difíciles; si cree que es básico, fáciles. Esto maximiza la información que obtiene de cada respuesta.

El sistema mapea el nivel estimado (el de mayor probabilidad posterior) con la dificultad objetivo de la siguiente pregunta:

| Nivel estimado | Dificultad objetivo |
|:--------------:|:-------------------:|
| Básico         | Fácil               |
| Medio          | Media               |
| Avanzado       | Difícil             |

Si no quedan preguntas disponibles en la dificultad objetivo, el sistema busca en dificultades adyacentes.

### Condición de parada basada en incertidumbre

> **Sin fórmulas:** el test no termina después de un número fijo de preguntas, sino cuando el sistema considera que ya sabe con suficiente seguridad cuál es el nivel del alumno. Esa seguridad se mide con una cantidad llamada *entropía*: cuando la incertidumbre es pequeña, el test concluye. Un alumno con un nivel muy claro puede terminar en 6 preguntas; uno con respuestas inconsistentes necesitará más.

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

> **Sin fórmulas:** un alumno que falla la primera pregunta media recibe preguntas fáciles, pero si las acierta repetidamente el sistema no sabe si es realmente básico o simplemente tuvo mala suerte al principio. Tras 2 aciertos seguidos en fáciles, se inserta una pregunta media para aclarar la duda. Los fallos en fáciles no necesitan este sondeo: ya confirman el nivel básico por sí solos.

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
