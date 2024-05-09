let zoomLevel = 1;
let isDraging = false;


const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: 600,
        height: 520,
        backgroundColor: "white",
        selection: false
    });
}

const setBackground = (url, canvas) => {
    fabric.Image.fromURL(url, (img) => {
        canvas.backgroundImage = img
        canvas.renderAll();
    })
}

const handleZoomIn = () => {
    setZoomLevel(zoomLevel + 0.1);
    canvas.setZoom(zoomLevel + 0.1);
};

const handleZoomOut = () => {
    if (zoomLevel > 0.1) {
        setZoomLevel(zoomLevel - 0.1);
        canvas.setZoom(zoomLevel - 0.1);
    }
};

document.getElementById('zoomIn').addEventListener('click', () => {
    zoomLevel = zoomLevel + 0.1;
    canvas.setZoom(zoomLevel + 0.1);
})

document.getElementById('zoomOut').addEventListener('click', () => {
    if (zoomLevel > 0.1) {
        zoomLevel = zoomLevel - 0.1;
        canvas.setZoom(zoomLevel - 0.1);
    }
})

document.getElementById('drag').addEventListener('click', () => {
    var element = document.getElementById("drag");

    if (isDraging) {
        element.classList.remove("active")
        isDraging = false;
        canvas.off('mouse:move'); // Detener el evento de arrastre
    } else {
        element.classList.add("active")
        canvas.on('mouse:move', (event) => {
            isDraging = true;
            // console.log(event.e.movementX)
            if (mousePressed) {
                canvas.setCursor('grab')
                const mEvent = event.e
                const delta = new fabric.Point(mEvent.movementX, mEvent.movementY)
                canvas.relativePan(delta)
            }
        })
    }
})

const createRect = (canvas) => {
    console.log("rec")
    const canvCenter = canvas.getCenter();
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

const createCircle = (canvas) => {
    console.log("rec")
    const canvCenter = canvas.getCenter();
    const circle = new fabric.Circle({
        radius: 30,
        fill: "orange",
        left: canvCenter.left,
        top: canvCenter.top,
        originX: 'center',
        originY: 'center',
    })
    canvas.add(circle)
    canvas.renderAll();
}


const canvas = initCanvas('canvas')
let mousePressed = false;

setBackground('https://i.pinimg.com/736x/d6/17/80/d61780ee78a35d5f4a92233d128b71bf.jpg', canvas)



canvas.on('mouse:down', (event) => {
    mousePressed = true
})

canvas.on('mouse:up', (event) => {
    mousePressed = false
})