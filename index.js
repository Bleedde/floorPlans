let zoomLevel = 1;
let isDraging = false;
let mousePressed = false;
var element = document.getElementById("drag");
let initialCanvasPosition = { left: 0, top: 0 };
let currentId = 0;


const svgState = {}

let bgUrl = 'https://res.cloudinary.com/dvrjzie6x/image/upload/v1715782256/floorPlan_tujpgr.png'
// https://i.pinimg.com/736x/d6/17/80/d61780ee78a35d5f4a92233d128b71bf.jpg

// reference canvas element (with id="canvas on the html")
const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: 1000,
        height: 700,
        selection: false,
    });


}

const setBackground = (url, canvas) => {
    fabric.Image.fromURL(url, (img) => {
        // Calcula el factor de escala para ajustar la imagen al tamaño del lienzo
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        // Establece la imagen de fondo y aplica el escalado
        canvas.setBackgroundImage(
            img,
            canvas.renderAll.bind(canvas),
            {
                originX: "center",
                originY: "center",
                top: canvCenter.top,
                left: canvCenter.left,
                // usa las constantes declaradas anteriormente para escalar la imagen al tamaño del lienzo
                scaleX: scaleX,
                scaleY: scaleY,
            }
        );
    });
}


const zoomIn = () => {
    zoomLevel = zoomLevel + 0.1;
    canvas.setZoom(zoomLevel + 0.1);
}

const zoomOut = () => {
    if (zoomLevel > 0.1) {
        zoomLevel = zoomLevel - 0.1;
        canvas.setZoom(zoomLevel - 0.1);
    }
}

const resetCanvasPosition = () => {
    canvas.absolutePan(new fabric.Point(initialCanvasPosition.left, initialCanvasPosition.top));
    canvas.setZoom(1)
};


const clearCanvas = (canvas, state) => {
    canvas.off('mouse:move')

    const currentBg = canvas.backgroundImage
    console.log(currentBg, "current backgroundd")

    // Restablece el zoom
    zoomLevel = 1
    canvas.setZoom(zoomLevel)

    resetCanvasPosition()

    state.val = canvas.toSVG();
    // Elimina el rectángulo blanco que agrega automaticamente del SVG
    state.val = state.val.replace('<rect x="0" y="0" width="100%" height="100%" fill="white"></rect>', '');
    canvas.getObjects().forEach((o) => {
        if (o !== canvas.backgroundImage) {
            canvas.remove(o);
        }
    });
};


const restoreCanvas = (canvas, state, bgUrl) => {
    if (state.val) {
        fabric.loadSVGFromString(state.val, objects => {
            console.log(state.val)
            console.log(objects)
            objects = objects.filter(o => o['xlink:href'] !== bgUrl)
            console.log(objects, "filtrados")
            canvas.add(...objects)
            canvas.requestRenderAll()
        })
    }
}

const createRect = (canvas) => {
    const id = generateUniqueId();
    const rect = new fabric.Rect({
        width: 50,
        height: 50,
        fill: "green",
        left: canvCenter.left,
        top: canvCenter.top,
        originX: 'center',
        originY: 'center',
    })

    rect.id = id
    canvas.add(rect)

    rect.on('mousedown', function (options) {
        console.log('Círculo con id:', id);
    });

    canvas.renderAll();
}

function generateUniqueId() {
    return currentId++;
}

// Crea un círculo en Fabric.js
const createCircle = (canvas, type, color = '#1796FF', top, left, selectable = false) => {
    // Crea un ID único para el círculo
    const id = generateUniqueId();

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

    let circle; // Define la variable circle fuera del bloque if

    if (type === "available") {
        circle = new fabric.Circle({
            radius: 10,
            fill: 'white',
            stroke: color,
            strokeWidth: 2,
            left: left,
            top: top,
            originX: 'center',
            originY: 'center',
            selectable: selectable,
            hoverCursor: 'default'
        });

        circle.id = id;

        canvas.add(circle, tooltip);

        circle.on('mouseover', function (options) {
            tooltip.set({
                left: left, // Ajusta la posición del tooltip relativa al cursor
                top: top, // Ajusta la posición del tooltip relativa al cursor
                visible: true // Hace visible el tooltip
            });
            canvas.bringToFront(tooltip); // Mueve el tooltip al frente
            canvas.renderAll();
        });

        circle.on('mouseout', function (options) {
            tooltip.set('visible', false); // Oculta el tooltip al salir del círculo
            canvas.renderAll();
        });

        circle.on('mousedown', function (options) {
            console.log('available con id:', id);
        });
    }

    else if (type === "occupied") {
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

        const circleGroup = new fabric.Group([outerCircle, innerCircle], {
            left: left,
            top: top,
            originX: 'center',
            originY: 'center',
            selectable: selectable,
            hoverCursor: 'pointer'
        });

        circleGroup.id = id;

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

        // Agrega el grupo de circulos al lienzo
        canvas.add(circleGroup)
        // Renderiza el lienzo
        canvas.renderAll();
    }

    else if (type === "offline") {
        // Crea el círculo exterior con borde rojo y sin relleno
        const outerCircle = new fabric.Circle({
            radius: 10,
            fill: 'white', // Sin relleno
            stroke: '#FF6262', // Borde rojo
            strokeWidth: 2,
            left: left,
            top: top,
            originX: 'center',
            originY: 'center'
        });

        // Crea un rectángulo en la mitad del círculo con fondo blanco
        const rectangle = new fabric.Rect({
            width: 12,
            height: 2,
            fill: '#FF6262', // Color del rectángulo
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
            hoverCursor: 'pointer'
        });

        group.id = id;

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

        canvas.add(group).renderAll();
    }
}

function createHub(canvas, top, left) {
    const id = generateUniqueId();

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
    </svg>`

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

    fabric.loadSVGFromString(svgCode, function (objects, options) {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ left: left, top: top, originX: 'center', originY: 'center', selectable: false, hoverCursor: 'default' });

        obj.id = id;

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

        canvas.add(obj);
        canvas.renderAll(); // Renderiza el lienzo
    });
}

function createGroup(canvas, top, left, type, fillColor = '#1796FF') {
    const id = generateUniqueId();
    let svgCode;

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

    if (type === 'available') {
        svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="35" height="33" viewBox="0 0 35 33" fill="none">
<circle cx="17.4471" cy="16.4437" r="10.7932" fill="white"/>
<path d="M30.5781 12.4006L27.468 7.00986H22.8928L20.5568 2.9668H14.3367L12.0007 7.00986H7.42552L4.31548 12.4006L6.65147 16.4437L4.31548 20.4867L7.42552 25.8775H12.0007L14.3367 29.9205H20.5568L22.8928 25.8775H27.468L30.5781 20.4867L28.2421 16.4437L30.5781 12.4006ZM27.4128 12.4006L25.8646 15.096H22.9066L21.3585 12.4006L22.9066 9.70523H25.8646L27.4128 12.4006ZM15.9816 19.139L14.4335 16.4437L15.9816 13.7483H18.912L20.4601 16.4437L18.912 19.139H15.9816ZM18.9396 5.66217L20.4877 8.33059L18.912 11.0529H15.9816L14.4058 8.33059L15.954 5.66217H18.9396ZM9.04275 9.70523H12.0007L13.5489 12.4006L12.0007 15.096H9.04275L7.48081 12.4006L9.04275 9.70523ZM7.48081 20.4867L9.02892 17.7914H11.9869L13.535 20.4867L11.9869 23.1821H9.04275L7.48081 20.4867ZM15.954 27.2252L14.4058 24.5567L15.9816 21.8344H18.912L20.4739 24.5567L18.9396 27.2252H15.954ZM25.8508 23.1821H22.8928L21.3447 20.4867L22.8928 17.7914H25.8508L27.3989 20.4867L25.8508 23.1821Z" fill="${fillColor}"/>
</svg>`
    } else {
        svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none" style="&#10;    background-color: black;&#10;">
<circle cx="16.2187" cy="16.0921" r="10.4677" fill="white"/>
<circle cx="15.9095" cy="16.0922" r="7.17654" fill="${fillColor}"/>
<path d="M28.7816 12.2241L25.8061 7.06668H21.4289L19.194 3.19861H13.2432L11.0083 7.06668H6.63108L3.65564 12.2241L5.89053 16.0922L3.65564 19.9603L6.63108 25.1177H11.0083L13.2432 28.9858H19.194L21.4289 25.1177H25.8061L28.7816 19.9603L26.5467 16.0922L28.7816 12.2241ZM25.7532 12.2241L24.2721 14.8028H21.4422L19.9611 12.2241L21.4422 9.6454H24.2721L25.7532 12.2241ZM14.8168 18.6709L13.3357 16.0922L14.8168 13.5135H17.6204L19.1015 16.0922L17.6204 18.6709H14.8168ZM17.6468 5.77732L19.1279 8.33025L17.6204 10.9348H14.8168L13.3093 8.33025L14.7904 5.77732H17.6468ZM8.17831 9.6454H11.0083L12.4894 12.2241L11.0083 14.8028H8.17831L6.68398 12.2241L8.17831 9.6454ZM6.68398 19.9603L8.16508 17.3815H10.9951L12.4762 19.9603L10.9951 22.539H8.17831L6.68398 19.9603ZM14.7904 26.407L13.3093 23.8541L14.8168 21.2496H17.6204L19.1147 23.8541L17.6468 26.407H14.7904ZM24.2589 22.539H21.4289L19.9478 19.9603L21.4289 17.3815H24.2589L25.74 19.9603L24.2589 22.539Z" fill="${fillColor}"/>
</svg>
`
    }

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
            originY: 'center'
        });

        // Crea el fondo del texto (rectángulo redondeado)
        const textBackground = new fabric.Rect({
            width: text.width + 5,
            height: text.height,
            fill: 'white', // Color del fondo del texto
            rx: 5, // Radio de la esquina redondeada en x
            ry: 5, // Radio de la esquina redondeada en y
            originX: 'center',
            originY: 'center',
            top: top - 20,
            left: left
        });

        const group = new fabric.Group([obj, textBackground, text], {
            left: left,
            top: top, // Posición ajustada para colocar el texto encima del SVG
            originX: 'center',
            originY: 'center',
            hoverCursor: 'default',
            selectable: false
        });


        group.id = id;

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

        canvas.add(group); // Agrega el fondo del texto al lienzo
        canvas.renderAll(); // Renderiza el lienzo
    });
}




const canvas = initCanvas('canvas')
const canvCenter = canvas.getCenter();

setBackground(bgUrl, canvas)


// Creacion de los puntos!
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


canvas.on('mouse:wheel', function (opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
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



