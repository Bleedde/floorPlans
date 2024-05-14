let zoomLevel = 1;
let isDraging = false;
let mousePressed = false;
var element = document.getElementById("drag");
let initialCanvasPosition = { left: 0, top: 0 };

const svgState = {}

let bgUrl = 'https://res.cloudinary.com/dvrjzie6x/image/upload/v1715712806/floorPlan_j5t0av.png'
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
                scaleY: scaleY
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
    console.log("rec")

    const rect = new fabric.Rect({
        width: 50,
        height: 50,
        fill: "green",
        left: canvCenter.left,
        top: canvCenter.top,
        originX: 'center',
        originY: 'center',
    })
    canvas.add(rect)
    canvas.renderAll();
}


// Crea un círculo en Fabric.js
const createCircle = (canvas, color) => {

    // Crea el círculo exterior con borde azul y relleno blanco
    const outerCircle = new fabric.Circle({
        radius: 10, // Tamaño del radio del círculo exterior
        fill: '', // Sin relleno
        stroke: color, // Borde azul
        strokeWidth: 3, // Ancho del borde exterior
        originX: 'center',
        originY: 'center'
    });

    // Crea el círculo interior con relleno azul
    const innerCircle = new fabric.Circle({
        radius: 6, // Tamaño del radio del círculo interior
        fill: color,
        originX: 'center',
        originY: 'center'
    });

    // Crea un círculo adicional para el fondo blanco
    const backgroundCircle = new fabric.Circle({
        radius: 10, // Tamaño del radio igual al del círculo interior
        fill: 'white', 
        originX: 'center',
        originY: 'center',
    });

    // Agrupa los tres círculos en un solo objeto de grupo
    const circleGroup = new fabric.Group([outerCircle, backgroundCircle, innerCircle], {
        left: canvCenter.left,
        top: canvCenter.top,
        originX: 'center',
        originY: 'center'
    });

    // Agrega el grupo al lienzo
    canvas.add(circleGroup);

    // Renderiza el lienzo
    canvas.renderAll();
}

const createPentagon = (canvas) => {
    // Define las coordenadas de los puntos para el pentágono
    const points = [
        { x: 0, y: 35 },
        { x: 100, y: 35 },
        { x: 75, y: 100 },
        { x: 25, y: 100 },
        { x: 0, y: 35 }
    ];

    // Crea el pentágono utilizando un polígono personalizado en Fabric.js
    const pentagon = new fabric.Polygon(points, {
        fill: 'white', 
        stroke: 'blue', 
        strokeWidth: 3, 
        left: canvCenter.left,
        top: canvCenter.top,
        originX: 'center',
        originY: 'center'
    });

    // Agrega el pentágono al lienzo
    canvas.add(pentagon);
    canvas.renderAll();
}

const canvas = initCanvas('canvas')
const canvCenter = canvas.getCenter();

setBackground(bgUrl, canvas)

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
    // Verifica si la tecla Ctrl está presionada
    if (event.e.ctrlKey) {
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
                canvas.setCursor('grab')
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



