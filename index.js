// Global variables
let zoomLevel = 1;
let isDraging = false;
let mousePressed = false;
let currentId = 0;
let opacity = 1;

// Initial canvas position
let initialCanvasPosition = { left: 0, top: 0 };

// Background image URL
let bgUrl = 'https://res.cloudinary.com/dvrjzie6x/image/upload/v1715782256/floorPlan_tujpgr.png'

function generateUniqueId() {
    // Incrementa y devuelve el valor de la variable global `currentId`
    return currentId++;
}

/**
 * Función para inicializar un lienzo de Fabric.js.
 * @param {string} id - ID del elemento HTML en el que se inicializará el lienzo.
 * @returns {fabric.Canvas} - Objeto Canvas de Fabric.js inicializado.
 */
const initCanvas = (id) => {
    // Crea y devuelve un nuevo objeto Canvas de Fabric.js con las siguientes propiedades:
    return new fabric.Canvas(id, {
        width: 1000,          // Ancho del lienzo en píxeles
        height: 700,          // Alto del lienzo en píxeles
        selection: false,     // Deshabilita la selección de objetos en el lienzo
    });
}

/**
 * Función para establecer una imagen de fondo en un lienzo de Fabric.js.
 * @param {string} url - URL de la imagen que se utilizará como fondo.
 * @param {fabric.Canvas} canvas - Lienzo de Fabric.js en el que se establecerá la imagen de fondo.
 */
const setBackground = (url, canvas) => {
    // Carga una imagen desde una URL utilizando fabric.js
    fabric.Image.fromURL(url, (img) => {
        // Calcula el factor de escala para ajustar la imagen al tamaño del lienzo
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;

        // Obtiene el centro del lienzo
        const canvCenter = canvas.getCenter();

        // Establece la imagen de fondo y aplica el escalado
        canvas.setBackgroundImage(
            img,                               // Imagen a establecer como fondo
            canvas.renderAll.bind(canvas),     // Renderiza el lienzo después de establecer la imagen de fondo
            {
                originX: "center",              // Punto de origen horizontal en el centro de la imagen
                originY: "center",              // Punto de origen vertical en el centro de la imagen
                top: canvCenter.top,            // Posición vertical de la imagen en el centro del lienzo
                left: canvCenter.left,          // Posición horizontal de la imagen en el centro del lienzo
                scaleX: scaleX,                 // Escala horizontal para ajustar la imagen al ancho del lienzo
                scaleY: scaleY                  // Escala vertical para ajustar la imagen al alto del lienzo
            }
        );
    });
}


/**
 * Función para establecer la opacidad de la imagen de fondo en un lienzo de Fabric.js.
 * @param {fabric.Canvas} canvas - Lienzo de Fabric.js en el que se modificará la opacidad de la imagen de fondo.
 * @param {number} opacity - Valor de opacidad que se aplicará a la imagen de fondo (entre 0 y 1).
 */
const setBackgroundOpacity = (canvas, opacity) => {
    // Verifica si hay una imagen de fondo en el lienzo
    if (canvas.backgroundImage) {
        // Establece la opacidad de la imagen de fondo
        canvas.backgroundImage.opacity = opacity;
        // Renderiza el lienzo para aplicar los cambios
        canvas.renderAll();
    }
}


// Zoom in the canvas
const zoomIn = () => {
    zoomLevel = zoomLevel + 0.1;
    canvas.setZoom(zoomLevel + 0.1);
}

// Zoom out the canvas
const zoomOut = () => {
    if (zoomLevel > 0.1) {
        zoomLevel = zoomLevel - 0.1;
        canvas.setZoom(zoomLevel - 0.1);
    }
}

//Función para restablecer la posición y el zoom del lienzo de Fabric.js a sus valores iniciales.
const resetCanvasPosition = () => {
    // Utiliza el método absolutePan() para mover el lienzo a su posición inicial
    canvas.absolutePan(new fabric.Point(initialCanvasPosition.left, initialCanvasPosition.top));
    // Restablece el zoom del lienzo a 1 (sin zoom)
    canvas.setZoom(1);
};



/**
 * Función para crear un círculo (sensor) en un lienzo de Fabric.js.
 * @param {fabric.Canvas} canvas - Lienzo de Fabric.js en el que se creará el círculo.
 * @param {string} type - Tipo de círculo ('available', 'occupied' o 'offline').
 * @param {string} color - Color del círculo (opcional, por defecto '#1796FF').
 * @param {number} top - Posición vertical (arriba) del círculo en el lienzo.
 * @param {number} left - Posición horizontal (izquierda) del círculo en el lienzo.
 * @param {boolean} selectable - Indica si el círculo es seleccionable (opcional, por defecto false).
 */
const createCircle = (canvas, type, color = '#1796FF', top, left, selectable = false) => {
    // Crea un ID único para el círculo
    const id = generateUniqueId();

    // Crea un tooltip para el círculo
    const tooltip = new fabric.Text(`${type} #${id}`, {
        fontFamily: 'Arial',
        fontSize: 15,
        fill: 'black',
        backgroundColor: 'yellow',
        cornerSize: 25,
        selectable: false,
        visible: false,
        hoverCursor: 'default'
    });


    // Crea el círculo dependiendo del tipo
    if (type === "available") {
        const circle = new fabric.Circle({
            radius: 10,
            fill: 'white',
            stroke: color,
            strokeWidth: 2,
            left: left,
            top: top,
            originX: 'center',
            originY: 'center',
            selectable: selectable,
            hoverCursor: 'default',
        });

        // Asigna un id único al círculo
        circle.e = id;

        // Agregar círculo y tooltip al canvas
        canvas.add(circle, tooltip);

        // Manejadores de eventos

        // Muestra el toolTip cuando se hace hover sobre el sensor
        circle.on('mouseover', function (options) {
            tooltip.set({
                left: left,
                top: top,
                visible: true
            });
            canvas.bringToFront(tooltip); // Trae el toolTip hacia el enfrete para que se sobreponga sobre todo
            canvas.renderAll();
        });


        // Esconde el toolTip cuando se quita el mouse de el
        circle.on('mouseout', function (options) {
            tooltip.set('visible', false);
            canvas.renderAll();
        });

        // Se podria llamar cualquier accion aqui! es solo un ejemplo con un console.log al hacer click sobre el elemento
        circle.on('mousedown', function (options) {
            console.log('available con id:', id);
        });

    } else if (type === "occupied") {
        // Crea un sensor de tipo ocupado
        const outerCircle = new fabric.Circle({
            radius: 10,
            fill: 'white',
            stroke: '#1796FF',
            strokeWidth: 2,
            originX: 'center',
            originY: 'center'
        });

        const innerCircle = new fabric.Circle({
            radius: 5.5,
            fill: color,
            originX: 'center',
            originY: 'center'
        });

        // Crea un grupo con los círculos para formar la figura deseada
        const circleGroup = new fabric.Group([outerCircle, innerCircle], {
            left: left,
            top: top,
            originX: 'center',
            originY: 'center',
            selectable: selectable,
            hoverCursor: 'default',
        });

        circleGroup.id = id;

        // Agregar grupo y tooltip al canvas
        canvas.add(circleGroup, tooltip);

        // Manejadores de eventos
        circleGroup.on('mouseover', function (options) {
            tooltip.set({
                left: left,
                top: top,
                visible: true
            });
            canvas.bringToFront(tooltip);
            canvas.renderAll();
        });

        circleGroup.on('mouseout', function (options) {
            tooltip.set('visible', false);
            canvas.renderAll();
        });

        circleGroup.on('mousedown', function (options) {
            console.log('occupied con id:', id);
        });

    } else if (type === "offline") {
        // Crear grupo para sensor fuera de línea
        const outerCircle = new fabric.Circle({
            radius: 10,
            fill: 'white',
            stroke: '#FF6262',
            strokeWidth: 2,
            left: left,
            top: top,
            originX: 'center',
            originY: 'center'
        });

        const rectangle = new fabric.Rect({
            width: 12,
            height: 2,
            fill: '#FF6262',
            left: left,
            top: top,
            originX: 'center',
            originY: 'center'
        });

        const group = new fabric.Group([outerCircle, rectangle], {
            left: left,
            top: top,
            originX: 'center',
            originY: 'center',
            selectable: selectable,
            hoverCursor: 'default'
        });

        group.id = id;

        // Agregar grupo y tooltip al canvas
        canvas.add(group, tooltip)

        // Manejadores de eventos
        group.on('mouseover', function (options) {
            tooltip.set({
                left: left,
                top: top,
                visible: true
            });
            canvas.bringToFront(tooltip);
            canvas.renderAll();
        });

        group.on('mouseout', function (options) {
            tooltip.set('visible', false);
            canvas.renderAll();
        });

        group.on('mousedown', function (options) {
            console.log('offline con id:', id);
        });

    }
}

/**
 * Función para crear un hub en un lienzo de Fabric.js.
 * @param {fabric.Canvas} canvas - Lienzo de Fabric.js en el que se creará el hub.
 * @param {number} top - Posición vertical (arriba) del hub en el lienzo.
 * @param {number} left - Posición horizontal (izquierda) del hub en el lienzo.
 */
function createHub(canvas, top, left) {
    // Genera un ID único para el hub
    const id = generateUniqueId();

    // Código SVG del hub
    let svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="33" viewBox="0 0 25 33" fill="none" style="&#10;    background-color: black;&#10;">
    <g id="Group 671">
    <g id="Group 601">
    <path id="Polygon 1" d="M12.7391 32.9265L3.76445 20.5949L21.8064 20.5949L12.7391 32.9265Z" fill="#B748FB"/>
    <circle id="Ellipse 16" cx="12.7371" cy="12.843" r="11.8993" transform="rotate(-180 12.7371 12.843)" fill="#B748FB"/>
    </g>
    <circle id="Ellipse 17" cx="9.78859" cy="17.8193" r="1.79231" fill="white"/>
    <circle id="Ellipse 18" cx="15.9706" cy="17.8193" r="1.79231" fill="white"/>
    <circle id="Ellipse 19" cx="15.9709" cy="7.86687" r="1.79231" transform="rotate(180 15.9709 7.86687)" fill="white"/>
    <circle id="Ellipse 20" cx="9.78893" cy="7.86687" r="1.79231" transform="rotate(180 9.78893 7.86687)" fill="white"/>
    <circle id="Ellipse 21" cx="18.6656" cy="12.8432" r="1.79231" transform="rotate(-60 18.6656 12.8432)" fill="white"/>
    <circle id="Ellipse 22" cx="6.90579" cy="12.843" r="1.79231" transform="rotate(120 6.90579 12.843)" fill="white"/>
    </g>
    </svg>`;

    // Crea un objeto de texto para el tooltip del hub
    const tooltip = new fabric.Text(`Hub #${id}`, {
        fontFamily: 'Arial',
        fontSize: 15,
        fill: 'black',
        backgroundColor: 'yellow',
        cornerSize: 25,
        selectable: false,
        visible: false,
        hoverCursor: 'default'
    });

    // Carga el SVG y crea un grupo con el objeto SVG y el tooltip
    fabric.loadSVGFromString(svgCode, function (objects, options) {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ left: left, top: top, originX: 'center', originY: 'center', selectable: false, hoverCursor: 'default' });

        // Asigna un ID único al hub
        obj.id = id;

        // Agrega el grupo del hub y el tooltip al lienzo
        canvas.add(obj, tooltip);

        // Maneja eventos del hub
        obj.on('mouseover', function (options) {
            tooltip.set({
                left: left,
                top: top,
                visible: true
            });
            canvas.bringToFront(tooltip);
            canvas.renderAll();
        });

        obj.on('mouseout', function (options) {
            tooltip.set('visible', false);
            canvas.renderAll();
        });

        obj.on('mousedown', function (options) {
            console.log('hub con id:', id);
        });

        canvas.renderAll(); // Renderiza el lienzo para reflejar los cambios
    });
}

/**
 * Función para crear un grupo en un lienzo de Fabric.js.
 * @param {fabric.Canvas} canvas - Lienzo de Fabric.js en el que se creará el grupo.
 * @param {number} top - Posición vertical (arriba) del grupo en el lienzo.
 * @param {number} left - Posición horizontal (izquierda) del grupo en el lienzo.
 * @param {string} type - Tipo de grupo ('available' o cualquier otro valor).
 * @param {string} fillColor - Color de relleno del objeto SVG (opcional, por defecto '#1796FF').
 */
function createGroup(canvas, top, left, type, fillColor = '#1796FF') {
    // Genera un ID único para el grupo
    const id = generateUniqueId();
    let svgCode;

    // Crea un objeto de texto para el tooltip
    const tooltip = new fabric.Text(`Group ${type} #${id}`, {
        fontFamily: 'Arial',
        fontSize: 15,
        fill: 'black',
        backgroundColor: 'yellow',
        cornerSize: 25,
        selectable: false,
        visible: false,
        hoverCursor: 'default'
    });

    // Determina el código SVG basado en el tipo de grupo
    if (type === 'available') {
        svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="35" height="33" viewBox="0 0 35 33" fill="none"><circle cx="17.4471" cy="16.4437" r="10.7932" fill="white"/><path d="M30.5781 12.4006L27.468 7.00986H22.8928L20.5568 2.9668H14.3367L12.0007 7.00986H7.42552L4.31548 12.4006L6.65147 16.4437L4.31548 20.4867L7.42552 25.8775H12.0007L14.3367 29.9205H20.5568L22.8928 25.8775H27.468L30.5781 20.4867L28.2421 16.4437L30.5781 12.4006ZM27.4128 12.4006L25.8646 15.096H22.9066L21.3585 12.4006L22.9066 9.70523H25.8646L27.4128 12.4006ZM15.9816 19.139L14.4335 16.4437L15.9816 13.7483H18.912L20.4601 16.4437L18.912 19.139H15.9816ZM18.9396 5.66217L20.4877 8.33059L18.912 11.0529H15.9816L14.4058 8.33059L15.954 5.66217H18.9396ZM9.04275 9.70523H12.0007L13.5489 12.4006L12.0007 15.096H9.04275L7.48081 12.4006L9.04275 9.70523ZM7.48081 20.4867L9.02892 17.7914H11.9869L13.535 20.4867L11.9869 23.1821H9.04275L7.48081 20.4867ZM15.954 27.2252L14.4058 24.5567L15.9816 21.8344H18.912L20.4739 24.5567L18.9396 27.2252H15.954ZM25.8508 23.1821H22.8928L21.3447 20.4867L22.8928 17.7914H25.8508L27.3989 20.4867L25.8508 23.1821Z" fill="${fillColor}"/></svg>`
    } else {
        svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none" style="&#10;    background-color: black;&#10;"><circle cx="16.2187" cy="16.0921" r="10.4677" fill="white"/><circle cx="15.9095" cy="16.0922" r="7.17654" fill="${fillColor}"/><path d="M28.7816 12.2241L25.8061 7.06668H21.4289L19.194 3.19861H13.2432L11.0083 7.06668H6.63108L3.65564 12.2241L5.89053 16.0922L3.65564 19.9603L6.63108 25.1177H11.0083L13.2432 28.9858H19.194L21.4289 25.1177H25.8061L28.7816 19.9603L26.5467 16.0922L28.7816 12.2241ZM25.7532 12.2241L24.2721 14.8028H21.4422L19.9611 12.2241L21.4422 9.6454H24.2721L25.7532 12.2241ZM14.8168 18.6709L13.3357 16.0922L14.8168 13.5135H17.6204L19.1015 16.0922L17.6204 18.6709H14.8168ZM17.6468 5.77732L19.1279 8.33025L17.6204 10.9348H14.8168L13.3093 8.33025L14.7904 5.77732H17.6468ZM8.17831 9.6454H11.0083L12.4894 12.2241L11.0083 14.8028H8.17831L6.68398 12.2241L8.17831 9.6454ZM6.68398 19.9603L8.16508 17.3815H10.9951L12.4762 19.9603L10.9951 22.539H8.17831L6.68398 19.9603ZM14.7904 26.407L13.3093 23.8541L14.8168 21.2496H17.6204L19.1147 23.8541L17.6468 26.407H14.7904ZM24.2589 22.539H21.4289L19.9478 19.9603L21.4289 17.3815H24.2589L25.74 19.9603L24.2589 22.539Z" fill="${fillColor}"/></svg>`
    }


    // Carga el SVG y crea un grupo con el objeto SVG, el texto y su fondo
    fabric.loadSVGFromString(svgCode, function (objects, options) {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({
            left: left,
            top: top,
            originX: 'center',
            originY: 'center',
        });

        // Crea el texto encima del objeto SVG
        const text = new fabric.Text('0/4', {
            left: left,
            top: top - 20,
            fontSize: 10,
            fontWeight: 'bold',
            fill: 'black',
            originX: 'center',
            originY: 'center',
            fontFamily: 'Arial',
        });

        // Crea el fondo del texto (rectángulo redondeado)
        const textBackground = new fabric.Rect({
            width: text.width + 5,
            height: text.height,
            fill: 'white',
            rx: 5, // Radio de la esquina redondeada en x
            ry: 5, // Radio de la esquina redondeada en y
            originX: 'center',
            originY: 'center',
            top: top - 20,
            left: left
        });

        // Crea un grupo que contiene el objeto SVG, el texto y su fondo
        const group = new fabric.Group([obj, textBackground, text], {
            left: left,
            top: top, // Posición ajustada para colocar el texto encima del SVG
            originX: 'center',
            originY: 'center',
            hoverCursor: 'default',
            selectable: false
        });

        // Asigna un ID único al grupo
        group.id = id;

        // Agrega el grupo y el tooltip al lienzo   
        canvas.add(group, tooltip);


        // Maneja eventos del grupo
        group.on('mouseover', function (options) {
            tooltip.set({
                left: left,
                top: top,
                visible: true
            });
            canvas.bringToFront(tooltip);
            canvas.renderAll();
        });

        group.on('mouseout', function (options) {
            tooltip.set('visible', false);
            canvas.renderAll();
        });

        group.on('mousedown', function (options) {
            console.log('group con id:', id);
        });

        // Renderiza el lienzo para reflejar los cambios
        canvas.renderAll();
    });
}

/**
 * Función para crear un rectángulo en un lienzo de Fabric.js.
 * @param {fabric.Canvas} canvas - Lienzo de Fabric.js en el que se creará el rectángulo.
 */
const createRect = (canvas) => {
    // Crea un ID único para el rectángulo
    const id = generateUniqueId();

    // Crea un rectángulo con las propiedades especificadas
    const rect = new fabric.Rect({
        width: 50,
        height: 50,
        fill: "green",
        left: canvCenter.left,
        top: canvCenter.top,
        originX: 'center',
        originY: 'center',
    });

    // Asigna un ID al rectángulo
    rect.id = id;

    // Agrega el rectángulo al lienzo
    canvas.add(rect);

    // Manejador de eventos para el clic del mouse en el rectángulo
    rect.on('mousedown', function (options) {
        console.log('Rectangulo con id:', id);
    });

    canvas.renderAll(); // Renderiza el lienzo para mostrar el rectángulo
}

/**
 * Función para ocultar o mostrar todos los objetos en un lienzo de Fabric.js.
 * @param {fabric.Canvas} canvas - Lienzo de Fabric.js en el que se encuentran los objetos.
 * @param {boolean} hide - Indica si se deben ocultar (true) o mostrar (false) los objetos.
 */
const hideAllObjects = (canvas, hide) => {
    // Obtiene todos los objetos en el lienzo
    const objects = canvas.getObjects();

    // Si hide es verdadero, oculta todos los objetos
    if (hide === true) {
        objects.forEach((obj) => {
            obj.visible = false;
        });
        // Renderiza el lienzo para reflejar los cambios
        canvas.renderAll();
    }
    // Si hide es falso, muestra los objetos con una propiedad 'id' y oculta los demás
    else {
        objects.forEach((obj) => {
            // Si el objeto tiene una propiedad 'id', lo muestra
            if (obj.id) {
                obj.visible = true;
            }
            // Si no tiene una propiedad 'id', lo oculta
            else {
                obj.visible = false;
            }
        });
        // Renderiza el lienzo para reflejar los cambios
        canvas.renderAll();
    }
}

// Inicializa un lienzo de Fabric.js con un ID específico ('canvas').
const canvas = initCanvas('canvas')

// Establece la imagen de fondo en el lienzo utilizando una URL específica.
setBackground(bgUrl, canvas)

// Obtiene el centro del lienzo
const canvCenter = canvas.getCenter();

// Creacion de los elementos!
createCircle(canvas, 'occupied', undefined, 70, 165);
createCircle(canvas, 'occupied', undefined, 70, 298);
createCircle(canvas, 'occupied', undefined, 70, 234);
createCircle(canvas, 'available', undefined, 70, 203);
createCircle(canvas, 'available', undefined, 70, 265);
createCircle(canvas, 'available', undefined, 70, 329);

createCircle(canvas, 'available', undefined, 180, 160);
createCircle(canvas, 'available', undefined, 230, 160);
createCircle(canvas, 'available', undefined, 180, 195);
createCircle(canvas, 'available', undefined, 207, 195);
createCircle(canvas, 'available', undefined, 233, 195);

createCircle(canvas, 'available', undefined, 99, 165);
createCircle(canvas, 'available', undefined, 99, 234);
createCircle(canvas, 'available', undefined, 99, 298);
createCircle(canvas, 'available', undefined, 99, 203);
createCircle(canvas, 'available', undefined, 99, 265);
createCircle(canvas, 'available', undefined, 99, 329);

createCircle(canvas, 'available', undefined, 128, 165);
createCircle(canvas, 'available', undefined, 128, 234);
createCircle(canvas, 'available', undefined, 128, 298);
createCircle(canvas, 'available', undefined, 128, 203);
createCircle(canvas, 'available', undefined, 128, 265);
createCircle(canvas, 'available', undefined, 128, 329);

createCircle(canvas, 'offline', undefined, 158, 714);
createCircle(canvas, 'offline', undefined, 158, 674);
createCircle(canvas, 'offline', undefined, 186, 674);
createCircle(canvas, 'available', undefined, 186, 714);
createCircle(canvas, 'offline', undefined, 214, 674);
createCircle(canvas, 'available', undefined, 214, 714);
createCircle(canvas, 'available', undefined, 240, 674);
createCircle(canvas, 'available', undefined, 240, 714);

createCircle(canvas, 'available', undefined, 158, 743);
createCircle(canvas, 'available', undefined, 186, 743);
createCircle(canvas, 'available', undefined, 214, 743);
createCircle(canvas, 'available', undefined, 240, 743);
createCircle(canvas, 'occupied', undefined, 158, 780);
createCircle(canvas, 'occupied', '#96EC6D', 186, 780);
createCircle(canvas, 'occupied', '#96EC6D', 214, 780);
createCircle(canvas, 'available', undefined, 240, 780);

createGroup(canvas, 74, 105, 'available');
createGroup(canvas, 108, 80, 'available');

createGroup(canvas, 180, 105, 'available');
createGroup(canvas, 220, 105, 'available');
createGroup(canvas, 198, 318, 'occupied', '#42CD00');
createGroup(canvas, 208, 504, 'occupied', '#42CD00');
createGroup(canvas, 90, 619, 'available', '#FF6262');
createGroup(canvas, 102, 699, 'available', '#FF6262');

createGroup(canvas, 255, 58, 'occupied');
createGroup(canvas, 345, 90, 'available');
createGroup(canvas, 420, 86, 'available');
createGroup(canvas, 420, 163, 'available');
createGroup(canvas, 380, 163, 'occupied');
createGroup(canvas, 407, 220, 'available');
createGroup(canvas, 327, 174, 'occupied');
createGroup(canvas, 327, 228, 'occupied');

createHub(canvas, 85, 650);
createHub(canvas, 627, 269);

//
canvas.on('mouse:wheel', function (opt) {
    // Obtiene la cantidad de desplazamiento de la rueda del ratón
    var delta = opt.e.deltaY;

    // Obtiene el nivel de zoom actual del lienzo
    var zoom = canvas.getZoom();

    // Calcula el nuevo nivel de zoom
    // Multiplica el nivel de zoom actual por 0.999 elevado a la potencia de delta
    zoom *= 0.999 ** delta;

    // Limita el nivel de zoom a un máximo de 1.8 y un mínimo de 0.8
    if (zoom > 1.8) zoom = 1.8;
    if (zoom < 0.8) zoom = 0.8;

    // Aplica el nuevo nivel de zoom al lienzo en el punto especificado por las coordenadas del ratón
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

    // Previene el comportamiento por defecto del evento de rueda del ratón
    opt.e.preventDefault();
    // Detiene la propagación del evento a otros event listeners
    opt.e.stopPropagation();
});


canvas.on('mouse:down', function (event) {
    // console.log(event.e)
    // Verifica si la tecla Command (Meta) está presionada en Mac
    if (event.e.metaKey || event.e.ctrlKey) {
        // Activa el arrastre del lienzo
        canvas.isDragging = true;

        // Obtiene la posición inicial del mouse
        var startX = event.e.clientX;
        var startY = event.e.clientY;

        // Event listener para el evento mousemove en el lienzo
        canvas.on('mouse:move', function (event) {
            // Verifica si se está arrastrando el lienzo
            if (canvas.isDragging) {
                // Cambia el cursor
                canvas.setCursor('grab');

                // Calcula la diferencia en la posición del mouse
                var deltaX = event.e.clientX - startX;
                var deltaY = event.e.clientY - startY;

                // Mueve el lienzo según la diferencia
                canvas.relativePan(new fabric.Point(deltaX, deltaY));

                // Actualiza la posición inicial del mouse
                startX = event.e.clientX;
                startY = event.e.clientY;
            }
        });

        // Event listener para el evento mouseup en el lienzo
        canvas.on('mouse:up', function () {
            // Desactiva el arrastre del lienzo
            canvas.isDragging = false;

            // Remueve los event listeners de mousemove y mouseup
            canvas.off('mouse:move');
            canvas.off('mouse:up');
        });
    }
});


// Obtén todos los objetos presentes en el lienzo
const objects = canvas.getObjects();

// Recorre cada objeto y hace un console.log de sus propiedades
objects.forEach((obj) => {
    if (obj.id) {
        console.log(obj)
        console.log('Tipo:', obj.type); // Tipo de objeto (círculo, rectángulo, etc.)
        console.log('ID:', obj.id); // ID del objeto, si se asignó anteriormente
        console.log('Posición (left, top):', obj.left, obj.top); // Posición izquierda y superior del objeto
        console.log('Dimensiones (width, height):', obj.width, obj.height); // Dimensiones del objeto (si tiene)
        console.log('-------');
    }
});


// canvas.on('mouse:down', (event) => {
//     mousePressed = true
// })

// canvas.on('mouse:up', (event) => {
//     mousePressed = false
// })

// const drag = () => {
//     if (isDraging) {
//         element.classList.remove("active")
//         isDraging = false;
//         canvas.off('mouse:move'); // Detener el evento de arrastre
//     } else {
//         element.classList.add("active")
//         canvas.on('mouse:move', (event) => {
//             isDraging = true;
//             // console.log(event.e.movementX)
//             if (mousePressed) {
//                 canvas.setCursor('grab')
//                 const mEvent = event.e
//                 const delta = new fabric.Point(mEvent.movementX, mEvent.movementY)
//                 canvas.relativePan(delta)
//             }
//         })
//     }
// }



