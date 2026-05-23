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

El núcleo del sistema es el teorema de Bayes:

```
P(H | E) = P(E | H) · P(H) / P(E)
```

Donde:

- **H** es una hipótesis sobre el nivel del alumno (Básico, Medio o Avanzado)
- **E** es la evidencia observada (respuesta correcta o incorrecta)
- **P(H)** es la probabilidad prior: lo que el sistema cree antes de ver la respuesta
- **P(E | H)** es la verosimilitud: la probabilidad de obtener esa respuesta si el alumno tuviera el nivel H
- **P(H | E)** es la probabilidad posterior: la creencia actualizada tras observar la respuesta

En la práctica se trabaja con tres hipótesis simultáneas (Básico, Medio, Avanzado), y el denominador P(E) se obtiene por normalización:

```
P(H_i | E) = P(E | H_i) · P(H_i) / Σ_j [ P(E | H_j) · P(H_j) ]
```

### El prior inicial

Al comenzar el test, el sistema no tiene ninguna información sobre el alumno. Se asigna una distribución uniforme:

```
P(Básico) = P(Medio) = P(Avanzado) = 1/3 ≈ 33%
```

Este prior expresa ignorancia total: las tres hipótesis son igualmente plausibles.

### La función de verosimilitud

Cada pregunta tiene asignado un nivel de dificultad (fácil, media o difícil). La verosimilitud recoge la probabilidad de que un alumno de cada nivel responda correctamente a cada tipo de pregunta:

|                  | Nivel Básico | Nivel Medio | Nivel Avanzado |
|------------------|:------------:|:-----------:|:--------------:|
| Pregunta fácil   |    85 %      |    93 %     |     98 %       |
| Pregunta media   |    35 %      |    65 %     |     88 %       |
| Pregunta difícil |    10 %      |    30 %     |     70 %       |

Estos valores reflejan el supuesto de que las preguntas están bien calibradas: una pregunta difícil discrimina entre niveles medios y avanzados, mientras que una pregunta fácil apenas aporta información sobre los niveles superiores (casi todos aciertan).

Si la respuesta es **incorrecta**, la verosimilitud usada es el complementario: `1 - P(E | H)`.

### La actualización bayesiana paso a paso

Supongamos que el sistema parte del prior uniforme y el alumno falla una pregunta media. La actualización sería:

```
Verosimilitudes del fallo medio:
  P(fallo medio | Básico)    = 1 - 0.35 = 0.65
  P(fallo medio | Medio)     = 1 - 0.65 = 0.35
  P(fallo medio | Avanzado)  = 1 - 0.88 = 0.12

Productos con el prior (1/3 cada uno):
  Básico:    0.65 × 0.333 = 0.2167
  Medio:     0.35 × 0.333 = 0.1167
  Avanzado:  0.12 × 0.333 = 0.0400

Suma total: 0.3734

Posterior normalizado:
  P(Básico | fallo medio)    = 0.2167 / 0.3734 ≈ 58%
  P(Medio | fallo medio)     = 0.1167 / 0.3734 ≈ 31%
  P(Avanzado | fallo medio)  = 0.0400 / 0.3734 ≈ 11%
```

Tras un solo fallo en una pregunta media, el sistema ya estima con un 58 % de confianza que el alumno es de nivel Básico. Este posterior se convierte en el prior de la siguiente pregunta, y así sucesivamente.

### Convergencia

La distribución converge porque cada respuesta multiplica las probabilidades por factores distintos para cada nivel. Con respuestas consistentes, la hipótesis verdadera acumula multiplicaciones favorables y las falsas se atenúan. En general, con 8-12 preguntas se obtiene una distribución suficientemente concentrada para tomar una decisión pedagógica con confianza.

---

## Selección adaptativa de preguntas

### Criterio de dificultad

El sistema mapea directamente el nivel estimado con la dificultad objetivo de la siguiente pregunta:

- Nivel estimado **Básico** → siguiente pregunta **fácil**
- Nivel estimado **Medio** → siguiente pregunta **media**
- Nivel estimado **Avanzado** → siguiente pregunta **difícil**

Si no quedan preguntas disponibles en la dificultad objetivo, el sistema busca en dificultades adyacentes.

### Criterio de categoría

Cuando hay varias preguntas candidatas en la dificultad correcta, el sistema prefiere las categorías menos representadas en el historial de la sesión. Esto garantiza que el test cubra distintas áreas temáticas en lugar de concentrarse en una sola.

### Aleatorización

Antes de aplicar el criterio de categoría, el pool de candidatas se mezcla aleatoriamente. Esto rompe el orden fijo del banco de preguntas y hace que cada sesión produzca una secuencia diferente, incluso para alumnos con el mismo nivel.

---

## Banco de preguntas

El banco contiene **60 preguntas** de cultura general, repartidas equitativamente:

- 20 preguntas de dificultad **fácil**
- 20 preguntas de dificultad **media**
- 20 preguntas de dificultad **difícil**

Las categorías incluyen: Geografía, Historia, Ciencia, Arte, Literatura, Filosofía, Matemáticas, Cultura y Deportes.

Cada sesión utiliza **10 preguntas**, seleccionadas adaptativamente. La combinación de 60 preguntas disponibles, selección aleatoria y adaptación al nivel hace que dos sesiones rara vez compartan la misma secuencia.

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
├── questions.js     Banco de 60 preguntas
└── README.md        Este documento
```

---

## Autor

Juan José de Haro
