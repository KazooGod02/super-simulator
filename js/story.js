// SUPER SIMULATOR · quién habla y todos los diálogos
(() => {
  "use strict";
  SS.WHO = {
    narr: { name: "", face: null, color: "#b0a7dc" },
    kazoo: { name: "KAZOO", face: "kazoo", color: "#ffd23f" },
    futuro: { name: "KAZOO DEL FUTURO", face: "futuro", color: "#2ee6d6" },
    k01: { name: "KAZOOGOD01", face: "kazoo01", color: "#fff3b0" },
    oozak: { name: "oozaK", face: "oozak", color: "#ff2bd6" },
    cero: { name: "SIMULATOR CERO", face: "cero", color: "#ff2bd6", glitch: true },
    ceroQ: { name: "???", face: "cero", color: "#ff2bd6", glitch: true },
    cesar: { name: "CÉSAR", face: "cesar", color: "#ff7a1a" },
    jesus: { name: "JESÚS", face: "jesus", color: "#2ee6d6" },
    carlos: { name: "CARLOS", face: "carlos", color: "#ff4fa3" },
    daniel: { name: "DANIEL", face: "daniel", color: "#6fb7ff" },
    cesarPro: { name: "CÉSAR PRODUCTIVO", face: "cesarPro", color: "#c9c5d6" },
    jesusPelon: { name: "JESÚS PELÓN", face: "jesusPelon", color: "#c9c5d6" },
    carlosCallado: { name: "CARLOS CALLADO", face: "carlosCallado", color: "#c9c5d6" },
    danielSonriente: { name: "DANIEL SONRIENTE", face: "danielSonriente", color: "#fff3b0" },
    lupe: { name: "DOÑA LUPE", face: "lupe", color: "#c9a3ff" },
    karina: { name: "KARINA", face: "karina", color: "#ffd23f" },
    yesenia: { name: "YESENIA", face: "yesenia", color: "#ff8fb1" },
    villana: { name: "LA VILLANA", face: "villana", color: "#e83b3b" },
    senpai: { name: "SENPAI SUPREMO", face: "senpai", color: "#2ee6d6" },
    hijo: { name: "EL HIJO DEL CASERO", face: "hijo", color: "#ffd23f" },
    casero: { name: "EL CASERO", face: "casero", color: "#6fb7ff" },
    algoritmo: { name: "EL ALGORITMO", face: null, color: "#ff2bd6" },
    pancho: { name: "PANCHO", face: "pancho", color: "#2ea84a" },
    cuquita: { name: "DOÑA CUQUITA", face: "cuquita", color: "#ff8fb1" },
    beto: { name: "DON BETO", face: "beto", color: "#e8e4dc" },
    kevin: { name: "KEVIN DEL 7", face: "kevin", color: "#2ee6a0" },
    paquete: { name: "EL PAQUETE", face: null, color: "#c79a6a" },
  };
  // compatibilidad con el prólogo (Cero todavía no tiene nombre ahí)
  SS.WHO.cero0 = SS.WHO.ceroQ;

  const TEXT = (SS.TEXT = {
    // ---------------- PRÓLOGO ----------------
    cold1: [
      ["k01", "Ya estuvo, oozaK. Esa piedra no es para esto."],
      ["oozak", "Tú tienes tu juego, tus compas y tu final. Yo soy tu reflejo y no tengo nada."],
      ["k01", "Todavía puedes tener algo. Bájale."],
      ["oozak", "Ya me cansé de ser el Kazoo al revés. Dámela."],
    ],
    cold2: [["k01", "Entonces que no la tenga nadie."]],
    cold3: [["oozak", "¡NO!"]],
    cold4: [["oozak", "...Te voy a encontrar, piedrita. En la dimensión que sea."]],
    start: [
      ["narr", "Culiacán, un martes cualquiera. 41 grados a la sombra."],
      ["kazoo", "Tres entregas y me voy a echar un aguachile. Fácil."],
    ],
    cuquita: [
      ["cuquita", "¡Ay, el muchacho del papel! Justo a tiempo, mijo, que ya íbamos en la servilleta."],
      ["kazoo", "Firme aquí, aquí y aquí, Doña Cuquita."],
      ["cuquita", "Toma, para tu refresco. Y ponte gorra, que te vas a insolar."],
      ["kazoo", "...Ya traigo gorra."],
    ],
    beto: [
      ["beto", "¿Doble hoja? ¿Quién te crees que soy, el gobernador?"],
      ["kazoo", "Usted lo pidió, Don Beto. Dice aquí: \"doble hoja, perfumado, urgente\"."],
      ["beto", "...Bueno, sí lo pedí. No le digas a nadie."],
    ],
    kevin: [
      ["kevin", "¿Ya viste que hay cuadritos grises en el cielo? En TikTok dicen que es el fin del mundo."],
      ["kazoo", "Será el calor, Kevin."],
      ["kevin", "Igual dame el papel. Por si sí."],
    ],
    package1: [
      ["kazoo", "Nomás queda este paquete. A ver... no trae remitente."],
      ["paquete", "\"PARA: KAZOO. NO ABRIR HASTA EL FINAL.\""],
      ["kazoo", "Pues ya es el final de la ruta, ¿no?"],
    ],
    package2: [
      ["kazoo", "¿Una piedra? Con forma de... ¿kazoo?"],
      ["kazoo", "Y un cartucho sin etiqueta. Qué paquete tan raro."],
      ["kazoo", "A ver si suena."],
    ],
    package3: [
      ["ceroQ", "ESA PIEDRA NO ES TUYA."],
      ["kazoo", "¿Quién dijo eso?"],
      ["ceroQ", "Nadie. Todavía no soy nadie. Pero ya te vi, KazooGod02."],
      ["kazoo", "...¿Cómo sabe mi usuario?"],
    ],
    package4: [["kazoo", "Se está borrando la calle. ¡A la Kazoovan!"]],
    van1: [["kazoo", "Ya estuvo. A ver si esta cosa arranca con todo y cuadritos."]],
    vanIntro: [
      ["narr", "Kazoo mete la piedra en el switch. La consolita vieja del tablero se prende sola y la camioneta empieza a crecer por dentro."],
      ["kazoo", "...¿Mi camioneta siempre tuvo sala?"],
      ["narr", "Esta es la Kazoovan. Camina a los lados y usa arriba para revisar las cosas. La consola del tablero te lleva a otras dimensiones."],
      ["kazoo", "César vive a diez minutos. Si alguien sabe qué es esto, es él. Se la vive en internet."],
    ],
    cesar1: [
      ["kazoo", "¡César! Soy yo. Te traigo tu papel de siempre, el de doble hoja."],
      ["cesarPro", "Buenos días. Disculpe, ya no compro papel por paquete. Lo pido por suscripción mensual, es más eficiente."],
      ["kazoo", "¿Eficiente? ¿Tú? ¿Y esa corbata?"],
      ["cesarPro", "Tengo junta a las 9 y luego a las 9:30. Me levanto a las 5 de la mañana."],
      ["kazoo", "César, tú no te levantas. ¿Dónde está Manuela?"],
      ["cesarPro", "No conozco a ninguna Manuela. Que tenga buen día."],
    ],
    cesar2: [
      ["kazoo", "No se acordó de mí."],
      ["narr", "La Kazoonita brilla. En la bolsa de Kazoo, el cartucho sin etiqueta ahora dice: \"01 · CÉSAR\"."],
      ["kazoo", "Alguien le borró la partida a César. Y la voy a recuperar."],
    ],
    gk: [["kazoo", "¡Un Kazoo Dorado! Hay tres escondidos en cada dimensión."]],
    photo: [["kazoo", "Una foto: yo y la Kazoovan, el primer día. Va para la pared de fotos."]],
    radio: n => [["kazoo", `En la radio: ${n}.`]],
    photos: n => n >= 20
      ? [["kazoo", "Las 20 fotos del grupo. Todas."], ["kazoo", "Ya no falta ninguna. Ni siquiera la de Daniel sonriendo."]]
      : n > 1 ? [["kazoo", `Fotos del grupo: ${n} de 20.`], ["kazoo", "Hay dos escondidas en cada dimensión de los compas, y una en Culiacán."]]
        : n === 1 ? [["kazoo", "Fotos del grupo: 1 de 20. Ahorita nomás está la de la Kazoovan."], ["kazoo", "Para las demás voy a necesitar compas."]]
          : [["kazoo", "La pared de fotos del grupo. Está vacía."], ["kazoo", "Dicen que en Culiacán hay una foto escondida en una azotea."]],
    boxesEmpty: [["kazoo", "Aquí atrás caben como cinco personas sentadas en cajas."], ["kazoo", "Sería buen lugar para platicar con los compas. Si tuviera compas aquí."]],
    boxesNone: [["kazoo", "Ya platicamos de todo lo que había que platicar. Por ahora."]],
    blueScreen: "KAZOOVERSO.EXE DEJÓ DE FUNCIONAR",

    // ---------------- NIVELES ----------------
    lv: {
      cesar: {
        intro: [["narr", "Dimensión César. El cuarto de siempre... pero limpio. Huele a Pinol. Hay un calendario lleno de juntas."], ["kazoo", "Esto está peor de lo que pensé. ¿Dónde están los botellones? ¿Dónde está el olor?"], ["kazoo", "Su mamá anda patrullando. Si me ve, me saca. Mejor que ni me vea."]],
        bossIntro: [["cesarPro", "¿Usted otra vez? Le dije que no compro papel. Estoy en una junta."], ["kazoo", "César, despierta. Tú no haces juntas, tú haces clics."], ["cesarPro", "Agendemos esta pelea. ¿Le parece en cinco segundos?"]],
        bossOutro: [["cesar", "...¿Kazoo? ¿Por qué traigo corbata? ¿Por qué está limpio mi cuarto?"], ["kazoo", "Te borraron la partida, compa. Pero ya regresaste."], ["cesar", "Me acuerdo del primer rollo que me trajiste. Doble hoja. 2012."], ["cesar", "Vámonos. Nomás dime que en la camioneta hay Wi-Fi."], ["narr", "CÉSAR se unió al equipo. Hackea compus, jala palancas pesadas y con su especial se hace invisible. Cambia de compa con Q y E."]],
      },
      jesus_calle: { intro: [["narr", "Dimensión Jesús. Guamúchil, mediodía. Nadie trae pelo de librito."], ["kazoo", "Jesús regaló sus figuras. Dicen que ahora va al gym nomás los lunes."], ["kazoo", "Hay que llegar a Mocorito. Y la policía anda con Nivel de Funa cinco."]] },
      jesus_tren: {
        bossIntro: [["jesusPelon", "¿Figuras de anime? Eso es para niños. Yo ya maduré. Y me rapé."], ["kazoo", "Jesús... tu librito. ¡Tu identidad!"], ["jesusPelon", "Hoy no es día de pierna. Hoy es día de pelear."]],
        bossOutro: [["jesus", "...¿Dónde está mi pelo? ¿Y mis 31 figuras?"], ["kazoo", "Te las devolvemos. Pero primero, ¿te acuerdas de mí?"], ["jesus", "Primer día de pierna. Tú te desmayaste en la sentadilla."], ["jesus", "Vámonos. Pero paramos en una barbería."], ["narr", "JESÚS se unió al equipo. Rompe paredes agrietadas, camina sobre el agua y multiplica tacos para curar."]],
      },
      carlos: {
        intro: [["narr", "Dimensión Carlos. La escuela está en silencio total. Nadie grita. Nadie larpea."], ["kazoo", "Si el prefecto me ve, me manda a la dirección. Y la dirección ahora es de Cero."]],
        bossIntro: [["carlosCallado", "Shhh. Estamos en la biblioteca."], ["kazoo", "Carlos, tú gritabas en clase. Era tu don."], ["carlosCallado", "Saqué diez en todo. Nadie se acuerda de mi nombre. Así está mejor."]],
        bossOutro: [["carlos", "...¿POR QUÉ ESTOY SUSURRANDO? ¡AAAAAAAH!"], ["kazoo", "Ahí está."], ["carlos", "Me acuerdo de mi primer grito en clase. El profe se cayó de la silla."], ["carlos", "Ya me cansé de estar callado. ¡Vámonos!"], ["narr", "CARLOS se unió al equipo. Su GRITO rompe vidrios y activa sensores. Larpeando, nadie lo reconoce."]],
      },
      daniel: {
        intro: [["narr", "Dimensión Daniel. La Primavera, de noche. Los vecinos sonríen demasiado."], ["kazoo", "Algo anda muy mal. Escucho a alguien saludando con entusiasmo."]],
        bossIntro: [["danielSonriente", "¡Hola, vecino! ¡Qué bonito día!"], ["kazoo", "Son las once de la noche, Daniel."], ["danielSonriente", "¡Todos los días son bonitos! ¿Peleamos? ¡Qué emoción!"]],
        bossOutro: [["daniel", "..."], ["kazoo", "¿Daniel?"], ["daniel", "...Me dolía la cara de tanto sonreír."], ["kazoo", "Ya regresó."], ["daniel", "Vámonos. Pancho, vente. Nieve, cuida la casa."], ["narr", "DANIEL se unió al equipo. Pelea en combo, manda a Pancho a picar botones y se cuelga de ganchos con las greñas."]],
      },
      telenovela: {
        intro: [["narr", "Dimensión Telenovela. Todo tiene zoom dramático y música de violín."], ["jesus", "Aquí está ella. La de los capítulos. Dicen que es Yesenia."], ["kazoo", "Jesús, concéntrate."], ["narr", "Esta dimensión necesita a todo el equipo. Si algo te bloquea, cambia de compa."]],
        bossIntro: [["villana", "Jesús Alberto... soy yo, tu Yesenia. Olvídate de tus amigos y quédate conmigo en este capítulo."], ["jesus", "Mi Yesenia no habla en cámara lenta. Y yo soy monogámico, señora."], ["villana", "¡¿SEÑORA?!"]],
        bossOutro: [["villana", "Esto... no se va a quedar así... *se desmaya dramáticamente*"], ["jesus", "Ya sé que la de verdad está en algún lado. La voy a encontrar."], ["narr", "Jesús ganó +1 Recuerdo."]],
      },
      anime: {
        intro: [["narr", "Dimensión Anime. Aquí gritar te da poder."], ["carlos", "¿Me están diciendo que aquí mi grito es un superpoder? ¿Siempre lo fue?"]],
        bossIntro: [["senpai", "Kazoo-kun. Tus amigos son débiles. Su poder no pasa de nueve mil."], ["carlos", "Yo sé de anime. Mi novia de Canadá es de Japón."], ["kazoo", "Eso no tiene sentido."], ["carlos", "¡POR ESO ES ANIME!"]],
        bossOutro: [["senpai", "...Tu grito... tiene propósito."], ["carlos", "Gracias. Lo practico en el baño."], ["narr", "Carlos ganó +1 Recuerdo."]],
      },
      lucha: {
        intro: [["narr", "Dimensión Lucha Libre. Arena Culiacán, lleno total."], ["daniel", "..."], ["kazoo", "Daniel trae máscara. No se le ve la cara. Aunque no haga falta."]],
        bossIntro: [["hijo", "¡Mi papá le revisaba la tubería a César! ¡Y hoy les revisamos la cara!"], ["casero", "¡Y nadie ha pagado la renta en tres dimensiones!"], ["cesar", "Yo sí pagué. Creo."]],
        bossOutro: [["casero", "Está bien, está bien. Les perdono la renta."], ["daniel", "...Buena pelea."], ["narr", "Daniel ganó +1 Recuerdo."]],
      },
      prehistoria: {
        intro: [["narr", "Dimensión Prehistórica. Culiacán, un millón de años antes de Cristo. 47 grados."], ["cesar", "No hay Wi-Fi. No hay señal. No hay nada. Me voy a morir."], ["kazoo", "Aguanta, César. Mira, más adelante pega el sol. A lo mejor te sirve."]],
        bossIntro: [["narr", "Un dinosaurio enorme con la boca llena de tacos de cabeza."], ["jesus", "Eso es un Tacosaurio Rex. Inventó los tacos de cabeza."], ["kazoo", "¿Y tú cómo sabes?"], ["jesus", "Lo leí en una figura."]],
        bossOutro: [["narr", "El Tacosaurio se cae y deja un hueso hueco. Kazoo lo sopla. Suena."], ["kazoo", "...Acabo de inventar el kazoo."], ["cesar", "¿Lo puedes inventar sin hacer ruido?"]],
      },
      internet: {
        intro: [["narr", "Dimensión Internet. Adentro del navegador de César. 400 pestañas abiertas."], ["cesar", "Este es mi territorio. Síganme y no le den clic a nada."], ["carlos", "¿Ni a \"Ganaste un iPhone\"?"], ["cesar", "Menos a ese."]],
        bossIntro: [["narr", "Una pantalla gigante con un ojo que te sigue."], ["algoritmo", "Según tu historial, te puede interesar: rendirte."], ["cesar", "Bloqueado."]],
        bossOutro: [["cesar", "Borré el historial. Por si acaso."], ["narr", "César ganó +1 Recuerdo."]],
      },
      abandonados: { intro: [["narr", "La Kazoovan Oscura se estrelló en la entrada de la Papelera. Cero se metió corriendo."], ["narr", "Adentro hay juegos a medio hacer: niveles sin textura, enemigos que se llaman ENEMIGO_TEMP y notas que dicen TODO."], ["carlos", "Esto da más miedo que el lunes."], ["kazoo", "Junten las notas TODO. Algo me dice que sirven para algo."]] },
      papelera: { intro: [["narr", "La Papelera de Reciclaje: una torre de archivos borrados. Cero espera hasta arriba."], ["jesus", "Puro cardio vertical. Me gusta."], ["cesar", "Odio esto."]], bossIntro: [["narr", "Arriba los esperan sus propias versiones genéricas. Las cuatro al mismo tiempo."], ["cesarPro", "Agendamos la revancha."], ["danielSonriente", "¡Qué bonita revancha!"], ["daniel", "...Ya cállate."]], bossOutro: [["narr", "Las versiones genéricas se deshacen en píxeles grises. Al fondo se abre una puerta al vacío."], ["kazoo", "Ahí está Cero."]] },
      cero: { intro: [["cero", "Llegaron. Los cinco. Qué bonito. Así los borro de un jalón."], ["kazoo", "oozaK, ya sé quién eres."], ["cero", "oozaK ya no existe. Ahora soy el último juego. Y no tengo final."]], bossIntro: [["cero", "Fase uno: placeholder. Lo que hagan, lo copio."]] },
      guardar: { intro: [["narr", "El multiverso se está recargando. Si no llegan al punto de guardado, todo se reinicia."], ["kazoo", "¡Corran!"]] },
    },
    cero2: [["cero", "¿No les gusta el placeholder? Les pongo caras conocidas."]],
    cero3: [["cero", "Error. Error. KAZOOVERSO.EXE no responde."], ["cesar", "¡Se le trabó! ¡Cuidado con las ventanas de error que caen!"]],
    cero4: [["cero", "Ya sé lo que quiero. Quiero ser SUPER SIMULATOR. ¡Quiero ser los cinco juegos al mismo tiempo!"], ["kazoo", "Pues juguemos los cinco al mismo tiempo."]],
    decision: [["oozak", "...Ya. Volví a perder. Bórrenme. Supr. Así terminan los juegos como yo."], ["kazoo", "O te terminamos."], ["oozak", "¿Qué?"]],
    choseTerminar: [["kazoo", "Te vamos a poner final, oozaK. Color, música y créditos."], ["oozak", "...¿En serio?"], ["cesar", "Hasta te hackeo un menú de pausa."]],
    choseBorrar: [["kazoo", "Lo siento, oozaK."], ["narr", "Kazoo presiona Supr. Cero se borra sin hacer ruido."]],
    choseCodigo: [["kazoo", "Esperen. Tengo las 30 notas TODO. Ya sé dónde está el código."], ["narr", "Kazoo rompe la cuarta pared."]],

    // ---------------- ACTO III ----------------
    twist: [
      ["narr", "Al regresar a la Kazoovan, algo se siente raro. La consola está prendida sola."],
      ["cero", "Gracias por juntarlos a todos. Así es más fácil borrarlos juntos."],
      ["kazoo", "¡Cero!"],
      ["narr", "Cero se roba la Kazoovan con todos los cartuchos y se va por la Carretera Interdimensional."],
      ["jesus", "Ahí hay un Tsuru prestado. Bueno, robado. Bueno, prestado."],
      ["kazoo", "¡Súbanse todos!"],
    ],
    ab1: [["narr", "Una nota pegada en un nivel sin terminar: \"Proyecto: SIMULATOR CERO. Personaje principal: oozaK. Estado: abandonado.\""], ["cesar", "¿Abandonado por quién?"], ["kazoo", "...No sé. Pero se ve muy viejo. Más viejo que todos nosotros."]],
    ab2: [["narr", "Un recuerdo guardado en el archivo: dos Kazoos frente a frente en la Dimensión 01."], ["k01", "Si alguien encuentra la piedra, que no se la dé a oozaK. Él no quiere jugar. Quiere que nadie juegue."], ["kazoo", "...KazooGod01. Por eso soy el 02."], ["daniel", "..."]],
    ab3: [["oozak", "Día 1: Soy el Kazoo al revés. Nadie me juega."], ["oozak", "Día 40: KazooGod01 tiene compas, música y final. Yo tengo sprites a medias."], ["oozak", "Día 41: Le quité todo. Pero aventó la piedra por un portal. Me quedé sin nada."], ["oozak", "Día 999: Me caí en la Papelera. Aquí abajo nadie se termina. Si yo no tuve final, nadie lo va a tener. Ahora me llamo Simulator Cero."], ["kazoo", "oozaK mató a KazooGod01 por la piedra. Y ahora quiere borrarnos a todos."], ["carlos", "Pues hay que gritarle con propósito."]],

    // ---------------- MISIONES DE RECUERDO ----------------
    missions: {
      cesar: [["cesar", "...¿Eso es el sol? ¿Así se ve de cerca?"], ["kazoo", "Sí, compa. Así."], ["cesar", "Quema. Pero está bonito. Gracias por sacarme del cuarto."]],
      jesus: [["yesenia", "¿Jesús? ¿Eres tú? Por fin contestaste."], ["jesus", "Yesenia... sí existes."], ["yesenia", "Claro que existo. Te espero cuando acabes de salvar el multiverso."], ["jesus", "Soy monogámico, eh. Que conste."]],
      carlos: [["karina", "¿Carlos? ¿Ya no gritas?"], ["carlos", "(bajito) Karina, me caes muy bien. Y no tengo novia en Canadá."], ["karina", "Ya sé. Era foto de stock. Pero gracias por decirlo bajito."]],
      daniel: [["daniel", "Nieve. Siéntate. Rueda."], ["narr", "Nieve rueda, se levanta y aúlla. Daniel, por un solo frame, sonríe."], ["kazoo", "¡Lo vi! ¡Sonreíste!"], ["daniel", "...No."]],
    },

    // ---------------- PLÁTICAS EN LA VAN ----------------
    talks: [
      { id: "k_cesar", who: ["cesar"], need: s => s.party.includes("cesar"), title: "Kazoo y César: el primer rollo", lines: [["kazoo", "¿Te acuerdas del primer rollo que te entregué?"], ["cesar", "2012. Doble hoja. Me dijiste \"firme aquí\" y yo pensé: este va a ser mi compa."], ["kazoo", "¿Por qué?"], ["cesar", "Porque fuiste el único que tocó la puerta dos veces."]] },
      { id: "k_jesus", who: ["jesus"], need: s => s.party.includes("jesus"), title: "Kazoo y Jesús: Yesenia", lines: [["jesus", "Oye, Kazoo. ¿Tú crees que Yesenia exista?"], ["kazoo", "En alguna dimensión, seguro."], ["jesus", "Con eso me basta. Monogámico interdimensional."]] },
      { id: "k_carlos", who: ["carlos"], need: s => s.party.includes("carlos"), title: "Kazoo y Carlos: el que sabe de todo", lines: [["carlos", "¿Sabías que el kazoo se inventó en la prehistoria?"], ["kazoo", "Carlos, ni hemos ido a la prehistoria."], ["carlos", "Todavía. Yo sé de todo."]] },
      { id: "k_daniel", who: ["daniel"], need: s => s.party.includes("daniel"), title: "Kazoo y Daniel: ...", lines: [["daniel", "..."], ["kazoo", "..."], ["daniel", "Gracias por venir por mí."], ["kazoo", "¿Esa fue tu frase más larga del año?"], ["daniel", "...Sí."]] },
      { id: "cesar_jesus", who: ["cesar", "jesus"], need: s => s.party.includes("cesar") && s.party.includes("jesus"), title: "César y Jesús: gym contra cuarto", lines: [["jesus", "César, ¿cuántas lagartijas haces?"], ["cesar", "Cuento los clics como cardio."], ["jesus", "Mañana te llevo al gym."], ["cesar", "Mañana tengo... cosas. En mi cuarto."]] },
      { id: "carlos_daniel", who: ["carlos", "daniel"], need: s => s.party.includes("carlos") && s.party.includes("daniel"), title: "Carlos y Daniel: gritar o no gritar", lines: [["carlos", "Daniel, ¿por qué nunca gritas?"], ["daniel", "..."], ["carlos", "¡¿POR QUÉ NUNCA GRITAS?!"], ["daniel", "Porque tú gritas por los dos."]] },
      { id: "cesar_carlos", who: ["cesar", "carlos"], need: s => SS.ACT2.filter(l => s.done[l]).length >= 2, title: "César y Carlos: la novia de Canadá", lines: [["cesar", "Carlos, busqué a tu novia de Canadá en Google."], ["carlos", "..."], ["cesar", "No le digo a nadie. Pero cámbiale la foto, se ve la marca de agua."]] },
      { id: "jesus_daniel", who: ["jesus", "daniel"], need: s => SS.ACT2.filter(l => s.done[l]).length >= 2, title: "Jesús y Daniel: Nieve y las figuras", lines: [["jesus", "¿Nieve come croquetas o pollo?"], ["daniel", "Pollo. Y tus figuras."], ["jesus", "¿CÓMO QUE MIS FIGURAS?"], ["daniel", "...Nomás una. La de Goku."]] },
    ],

    // ---------------- FINALES ----------------
    endings: {
      A: { title: "FINAL A · 100% COMPLETADO", lines: [["narr", "El equipo le pone color, música y una pantalla de créditos chiquita a Cero. Ya no está a medias."], ["oozak", "...Ya no estoy a medias."], ["narr", "oozaK toca su kazoo al revés. Suena igual de mal que el de Kazoo."], ["narr", "Se despiden en el Malecón, arriba de la Kazoovan, al atardecer. El juego toma la foto final del grupo."], ["cesar", "Ya salí al sol. Quema. Pero vale la pena."], ["jesus", "Voy a ver a Yesenia. Y mañana, pierna."], ["carlos", "¡LOS QUIERO MUCHO! ...Perdón. Los quiero mucho."], ["daniel", "...Nos vemos el viernes."], ["kazoo", "Siempre el viernes."], ["narr", "Kazoo va a la paquetería y escribe en una caja: \"PARA: KAZOO. NO ABRIR HASTA EL FINAL\". Adentro va la Kazoonita."]] },
      B: { title: "FINAL B · GUARDAR Y SALIR", lines: [["narr", "Todos recuperan su partida y regresan a sus dimensiones."], ["narr", "En el librero de Kazoo Studios queda un hueco gris, donde iba un cartucho."], ["kazoo", "..."], ["narr", "Kazoo lo ve un rato y apaga la luz. Antes de irse, manda un paquete: \"PARA: KAZOO. NO ABRIR HASTA EL FINAL\"."]] },
      C: { title: "FINAL C · SIN DATOS GUARDADOS", lines: [["narr", "Cero ganó. Nadie se acuerda de Kazoo."], ["narr", "Al otro día, Kazoo entrega papel en casa de César. Le abre con corbata."], ["cesarPro", "¿Te conozco?"], ["kazoo", "...No. Aquí está su papel."], ["narr", "César se queda viendo el rollo más tiempo de lo normal."]] },
      D: { title: "FINAL D · PANTALLA AZUL", lines: [["narr", "El Glitchómetro llegó a 100%. El multiverso entero se trabó."]] },
      E: { title: "FINAL E · MODO DESARROLLADOR", lines: [["kazoo", "Ya sé dónde está el código."], ["narr", "Kazoo abre js/finale.js. Es literal."], ["kazoo", "Aquí, línea por línea. oozaK: tú sí tienes final."], ["oozak", "...¿Me estás programando un final ahorita?"], ["kazoo", "En vivo. Con todo y créditos."], ["narr", "El juego se recompila. oozaK sale con color, con música y con su propio cartucho en el librero."]] },
    },
    credits: [
      ["SUPER SIMULATOR", ""],
      ["UNA PRODUCCIÓN DE", "KAZOO STUDIOS"],
      ["DIRECCIÓN", "KazooGod02"],
      ["ELENCO", "Kazoo · César · Jesús · Carlos · Daniel"],
      ["CON", "Doña Lupe · Karina · Yesenia · Nieve · Pancho"],
      ["Y", "Doña Cuquita · Don Beto · Kevin del 7"],
      ["VILLANO", "Simulator Cero (oozaK)"],
      ["EN MEMORIA DE", "KazooGod01"],
      ["LA FRANQUICIA", "César · Kazoo · Jesus · Carlos · Daniel Simulator"],
      ["HECHO CON", "Calor de Culiacán (literal)"],
      ["GRACIAS POR JUGAR", "Cinco compas, una camioneta, cero partidas guardadas."],
    ],
  });
})();
