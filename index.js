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
const createCircle = (canvas, type, color = '#1796FF', top, left) => {
    // Crea un ID único para el círculo
    const id = generateUniqueId();

    let circle; // Define la variable circle fuera del bloque if

    if (type === "available") {
        circle = new fabric.Circle({
            radius: 10, // Tamaño del radio del círculo
            fill: 'white', // Relleno blanco
            stroke: color, // Borde azul
            strokeWidth: 2, // Ancho del borde
            left: left,
            top: top,
            originX: 'center',
            originY: 'center'
        });

        circle.id = id;

        circle.on('mousedown', function (options) {
            console.log('available con id:', id);
        });
        // Agrega el circulo al grupo 
        canvas.add(circle)
        // Renderiza el lienzo
        canvas.renderAll();
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
            selectable: true
        });

        circleGroup.id = id;

        circleGroup.on('mousedown', function (options) {
            console.log('occupied con id:', id);
            // Aquí puedes agregar la lógica que desees ejecutar cuando se haga clic en el triángulo
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

        // Crea un círculo blanco para simular el fondo detrás del rectángulo


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
            selectable: true
        });

        group.id = id;

        group.on('mousedown', function (options) {
            console.log('offline con id:', id);
            // Aquí puedes agregar la lógica que desees ejecutar cuando se haga clic en el círculo offline
        });

        canvas.add(group);
        // Renderiza el lienzo
        canvas.renderAll();
    }

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


// Creacion de los puntos!
createCircle(canvas, 'occupied', undefined, 70, 165);
createCircle(canvas, 'occupied', undefined, 70, 298);
createCircle(canvas, 'occupied', undefined, 70, 234);
createCircle(canvas, 'available', undefined, 70, 203);
createCircle(canvas, 'available', undefined, 70, 265);
createCircle(canvas, 'available', undefined, 70, 329);

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
    console.log('Tipo:', obj.type); // Tipo de objeto (círculo, rectángulo, etc.)
    console.log('ID:', obj.id); // ID del objeto, si se asignó anteriormente
    console.log('Posición (left, top):', obj.left, obj.top); // Posición izquierda y superior del objeto
    console.log('Dimensiones (width, height):', obj.width, obj.height); // Dimensiones del objeto (si tiene)
    console.log('-------');
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



