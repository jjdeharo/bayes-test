# Sistema Adaptativo Bayesiano

Demo educativa de evaluación adaptativa basada en el teorema de Bayes y la entropía de Shannon.  
Acceso: **https://jjdeharo.github.io/bayes-test/**

---

## Qué es y para qué sirve

Este programa es una demostración de cómo la inferencia bayesiana y la teoría de la información pueden aplicarse conjuntamente a la evaluación educativa. A diferencia de un test convencional, donde todas las preguntas están fijadas de antemano, este sistema observa cada respuesta del alumno como una evidencia y actualiza en tiempo real su estimación sobre el nivel de conocimiento. A partir de esa estimación, selecciona dinámicamente la siguiente pregunta más informativa.

El **teorema de Bayes** actualiza las probabilidades tras cada respuesta: combina lo que el sistema ya creía con la nueva evidencia para obtener una estimación revisada. La **entropía de Shannon** mide cuánta incertidumbre queda en esa estimación y determina cuándo el sistema sabe suficiente para detener el test. Ambos conceptos trabajan juntos: Bayes actualiza, Shannon decide cuándo parar.

El objetivo pedagógico no es solo calificar al alumno al final, sino ir reduciendo la incertidumbre sobre su nivel a lo largo del propio test, de forma que con pocas preguntas se obtenga una estimación más precisa que con un test lineal más largo.

---

## Fundamentos matemáticos

### El teorema de Bayes

> **Resumen sin fórmulas:** el sistema parte de una creencia inicial sobre el nivel del alumno y la corrige tras cada respuesta. Si el alumno acierta algo difícil, la probabilidad de que sea avanzado sube; si falla algo fácil, baja. La fórmula de Bayes es el mecanismo matemático que hace esa corrección de forma rigurosa.

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

> **Resumen sin fórmulas:** al comenzar, el sistema no sabe nada del alumno y trata los tres niveles como igualmente probables. Es un punto de partida neutral.

Al comenzar el test, el sistema no tiene ninguna información sobre el alumno. Se asigna una distribución uniforme:

$$P(\text{Básico}) = P(\text{Medio}) = P(\text{Avanzado}) = \frac{1}{3} \approx 33\%$$

Este prior expresa ignorancia total: las tres hipótesis son igualmente plausibles.

### Modelo IRT de tres parámetros (3PL) — verosimilitudes dinámicas

> **Resumen sin fórmulas:** en lugar de usar una tabla fija de probabilidades, el sistema calcula automáticamente para cada pregunta la probabilidad de que un alumno de cada nivel la acierte. Esa probabilidad depende de la dificultad de la pregunta, del número de opciones y del nivel hipotético del alumno. La corrección por azar garantiza que ninguna pregunta tenga una probabilidad de acierto inferior a la que correspondería responder al azar.

Las verosimilitudes se calculan de forma dinámica para cada pregunta mediante la función logística IRT 3PL:

$$P(\text{acierto} \mid H_i, q) = c_q + (1 - c_q) \cdot \frac{1}{1 + e^{-a(\theta_i - b_q)}}$$

Donde:

- $\theta_i$ es el valor numérico del nivel $H_i$: Básico $= -2$, Medio $= 0$, Avanzado $= 2$
- $b_q$ es la dificultad de la pregunta $q$: Fácil $= -1$, Media $= 0$, Difícil $= 1$
- $a = 1{,}5$ es el parámetro de discriminación (controla la pendiente de la curva)
- $c_q = \tfrac{1}{m_q}$ es el suelo de acierto por azar ($m_q$ = número de opciones; $c_q = 0{,}25$ para 4 opciones)

Si la respuesta es **incorrecta**, la verosimilitud usada es el complementario: $P(\text{fallo} \mid H_i, q) = 1 - P(\text{acierto} \mid H_i, q)$.

Los valores resultantes para preguntas de 4 opciones ($c = 0{,}25$, $a = 1{,}5$) son:

|                  | Básico ($\theta=-2$) | Medio ($\theta=0$) | Avanzado ($\theta=2$) |
|------------------|:--------------------:|:------------------:|:---------------------:|
| Fácil ($b=-1$)   |       38,7 %         |      86,3 %        |       99,2 %          |
| Media ($b=0$)    |       28,6 %         |      62,5 %        |       96,4 %          |
| Difícil ($b=1$)  |       25,8 %         |      38,7 %        |       86,3 %          |

Cada pregunta lleva sus propios parámetros `dificultad` ($b_q$) y `opciones` ($m_q$), por lo que sus verosimilitudes se computan individualmente y no dependen de ninguna tabla global.

La corrección por azar $c_q$ garantiza que ningún alumno tenga una probabilidad de acierto inferior a la que tendría respondiendo al azar, lo que hace los aciertos menos diagnósticos que los fallos: un fallo prueba ignorancia directamente, mientras que un acierto puede deberse a la suerte.

### La actualización bayesiana paso a paso

> **Resumen sin fórmulas:** este ejemplo muestra cómo un solo fallo en una pregunta media es suficiente para que el sistema pase de no saber nada (33 % para cada nivel) a estimar con un 63,5 % de confianza que el alumno es de nivel Básico.

Supongamos que el sistema parte del prior uniforme y el alumno falla una pregunta media ($b_q = 0$, $m_q = 4$). Con el modelo IRT ($\theta = -2, 0, 2$) las verosimilitudes del fallo son:

$$P(\text{fallo} \mid \text{Media}, \text{Básico}) = 1 - 0{,}286 = 0{,}714$$
$$P(\text{fallo} \mid \text{Media}, \text{Medio}) = 1 - 0{,}625 = 0{,}375$$
$$P(\text{fallo} \mid \text{Media}, \text{Avanzado}) = 1 - 0{,}964 = 0{,}036$$

**Productos con el prior** $\left(\frac{1}{3}\right)$:

$$\text{Básico:} \quad 0{,}714 \times \tfrac{1}{3} = 0{,}238 \qquad \text{Medio:} \quad 0{,}375 \times \tfrac{1}{3} = 0{,}125 \qquad \text{Avanzado:} \quad 0{,}036 \times \tfrac{1}{3} = 0{,}012$$

**Normalización** — suma total: $0{,}238 + 0{,}125 + 0{,}012 = 0{,}375$

**Posterior:**

$$P(\text{Básico} \mid \text{fallo media}) = \frac{0{,}238}{0{,}375} \approx 63{,}5\%$$
$$P(\text{Medio} \mid \text{fallo media}) = \frac{0{,}125}{0{,}375} \approx 33{,}3\%$$
$$P(\text{Avanzado} \mid \text{fallo media}) = \frac{0{,}012}{0{,}375} \approx 3{,}2\%$$

Tras un solo fallo en una pregunta media, el sistema estima con un 63,5 % de confianza que el alumno es de nivel Básico. Este posterior se convierte en el prior de la siguiente pregunta.

### Convergencia

> **Resumen sin fórmulas:** con cada respuesta, el nivel verdadero del alumno se va haciendo más probable y los demás menos. El sistema no necesita muchas preguntas para llegar a una estimación fiable si las respuestas son consistentes.

La distribución converge porque cada respuesta multiplica las probabilidades por factores distintos para cada nivel. Con respuestas consistentes, la hipótesis verdadera acumula multiplicaciones favorables y las demás se atenúan.

---

## Selección adaptativa de preguntas

### Ganancia esperada de información

> **Resumen sin fórmulas:** antes de mostrar cada pregunta, el sistema calcula cuánta incertidumbre esperaría reducir con cada pregunta disponible y elige la que más información aportaría. No es necesariamente la más difícil ni la del nivel estimado: puede ser una que ayude a distinguir entre dos hipótesis todavía plausibles.

Para seleccionar la siguiente pregunta, el sistema calcula la **ganancia esperada de información** para cada candidata:

$$IG(q) = H(\pi) - \bigl[P(A)\cdot H(\pi_A) + P(F)\cdot H(\pi_F)\bigr]$$

Donde:

- $H(\pi) = -\sum_i \pi_i \log_2 \pi_i$ es la entropía actual
- $P(A) = \sum_i \pi_i \cdot P(\text{acierto} \mid H_i, q)$ es la probabilidad marginal de acierto
- $\pi_A$ y $\pi_F$ son los posteriors simulados ante acierto y fallo respectivamente
- $P(F) = 1 - P(A)$

Se selecciona la pregunta con mayor $IG$. Entre candidatas con ganancia prácticamente igual, se elige al azar con peso inversamente proporcional a las veces que su categoría ha aparecido ya, para favorecer la diversidad temática. La aleatorización usa el algoritmo de Fisher-Yates para garantizar una distribución uniforme.

### Condición de parada basada en incertidumbre

> **Resumen sin fórmulas:** el test no termina después de un número fijo de preguntas, sino cuando el sistema considera que ya sabe con suficiente seguridad cuál es el nivel del alumno. Esa seguridad se mide con la entropía y con la probabilidad de la hipótesis más probable. Un alumno con un nivel muy claro puede terminar en 6 preguntas; uno con respuestas inconsistentes necesitará más.

El test finaliza cuando se cumplen **simultáneamente** las dos condiciones siguientes, con un mínimo de **6 preguntas**:

1. $H(\pi) < H_{\text{stop}}$
2. $\max_i \pi_i \geq 0{,}80$

Comprobar los dos criterios es necesario porque $H_{\text{stop}}$ se calcula suponiendo distribución uniforme de la probabilidad residual, lo que es una aproximación.

**Entropía inicial** — prior uniforme sobre 3 niveles:

$$H_0 = \log_2 3 \approx 1{,}585 \text{ bits}$$

**Umbral de parada** — entropía de la distribución $[0{,}80,\, 0{,}10,\, 0{,}10]$, la menos concentrada que aún pone el 80 % de masa en un nivel:

$$H_{\text{stop}} = -(0{,}80\log_2 0{,}80 + 0{,}10\log_2 0{,}10 + 0{,}10\log_2 0{,}10) \approx 0{,}922 \text{ bits}$$

**Número máximo de preguntas** — se calcula mediante búsqueda minimax sobre el árbol completo de respuestas posibles. En cada nodo el sistema elige la pregunta más informativa disponible (máxima $IG$) y se explora el peor caso de respuesta posible. La profundidad máxima del árbol antes de alcanzar $H < H_{\text{stop}}$ es $MAX\_Q$, garantizando que el test termina en ese número de preguntas sea cual sea la secuencia de respuestas. Este valor se muestra en la interfaz como referencia de transparencia.

La barra de progreso refleja la **reducción relativa de entropía** hacia $H_{\text{stop}}$:

$$\text{progreso} = \frac{H_0 - H(\pi)}{H_0 - H_{\text{stop}}}$$

### Recuperación automática

La selección por máxima ganancia de información hace que la recuperación sea automática: si el alumno falla preguntas al principio pero después responde correctamente preguntas más difíciles, el posterior se desplaza y el sistema selecciona preguntas cada vez más exigentes sin ninguna lógica adicional.

---

## Interpretación pedagógica final

Al terminar el test, el sistema genera una interpretación pedagógica estructurada que incluye:

- **Dominio observado:** descripción del nivel con desglose de aciertos por dificultad
- **Dificultades detectadas:** categorías con más errores, destacando los fallos en preguntas fáciles
- **Recomendación:** acción concreta según el nivel estimado (refuerzo, consolidación o ampliación)
- **Grado de certeza:** si el diagnóstico es firme (ambos criterios de parada cumplidos) o provisional

Cuando el test termina por límite de preguntas sin haber convergido, el resultado se marca visualmente como **estimación provisional** y el texto lo indica explícitamente. Un diagnóstico provisional puede ocurrir cuando el patrón de respuestas es inusual (por ejemplo, varios fallos iniciales seguidos de muchos aciertos), situación en la que la incertidumbre es genuinamente alta y sería incorrecto presentar el resultado como definitivo.

---

## Banco de preguntas

El banco contiene **90 preguntas** de cultura general, repartidas equitativamente:

- 30 preguntas de dificultad **fácil** ($b_q = -1$)
- 30 preguntas de dificultad **media** ($b_q = 0$)
- 30 preguntas de dificultad **difícil** ($b_q = 1$)

Todas las preguntas son de opción múltiple con 4 respuestas ($m_q = 4$, $c_q = 0{,}25$). Cada pregunta lleva sus propios parámetros `dificultad` y `opciones`, por lo que el modelo puede incorporar preguntas con distinto número de opciones sin cambiar el motor bayesiano.

Las categorías incluyen: Geografía, Historia, Ciencia, Arte, Literatura, Filosofía, Matemáticas, Cultura y Deportes. Las preguntas están diseñadas para ser accesibles a cualquier persona con educación general, independientemente de su país de origen.

Cada sesión utiliza entre 6 y $MAX\_Q$ preguntas, seleccionadas adaptativamente. La combinación de 90 preguntas disponibles, selección aleatoria ponderada y adaptación al nivel hace que dos sesiones rara vez compartan la misma secuencia.

Las preguntas están definidas en `questions.js`, separado de la lógica del sistema, lo que facilita ampliar o modificar el banco sin tocar el algoritmo.

---

## Por qué este enfoque es pedagógicamente relevante

**Eficiencia:** un test adaptativo necesita menos preguntas que un test lineal para alcanzar la misma precisión diagnóstica, porque evita hacer preguntas demasiado fáciles o demasiado difíciles para el nivel real del alumno.

**Transparencia:** el sistema muestra en tiempo real la distribución de probabilidad actualizada tras cada respuesta. El alumno o el docente pueden observar cómo la evidencia va modificando la estimación.

**Honestidad sobre la incertidumbre:** cuando el sistema no puede alcanzar un diagnóstico firme, lo indica explícitamente. No presenta una etiqueta de nivel cuando la incertidumbre sigue siendo alta.

**Ausencia de umbral fijo:** a diferencia de los tests clásicos donde se establece un porcentaje de corte arbitrario, aquí el nivel se estima como una distribución continua. El sistema expresa su confianza en cada hipótesis, lo que proporciona una imagen más matizada del conocimiento.

**Escalabilidad conceptual:** aunque esta demo trabaja con tres niveles, el mismo esquema se puede extender a más niveles, a la detección de errores conceptuales específicos o a múltiples dimensiones de conocimiento simultáneas, simplemente ampliando el espacio de hipótesis y los parámetros de las preguntas.

---

## Estructura del proyecto

```
bayes-test/
├── index.html                                    Interfaz y lógica del sistema bayesiano
├── questions.js                                  Banco de 90 preguntas
├── documentacion.html                            Protocolo para crear sistemas adaptativos bayesianos
├── matematicas.html                              Explicación matemática detallada con ejemplos numéricos
├── documentacion_evaluacion_adaptativa_bayesiana.md  Fuente de la documentación (Markdown)
└── README.md                                     Este documento
```

---

## Autor

Juan José de Haro · [bilateria.org](https://bilateria.org)
