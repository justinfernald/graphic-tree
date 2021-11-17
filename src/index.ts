import { onLoad, onResize, pressedKeys, vec4s } from "./utils/base";
import WebGLUtils from "./lib/webgl/webgl-utils";
import {
    clearSetup,
    Direction,
    loadShaders,
    rotate,
    Vec3,
    viewportSetup,
} from "./utils/graphics";
import Renderer from "./renderer/renderer";
import Cube from "./shapes/cube";
import Cylinder from "./shapes/cylinder";
import Empty from "./shapes/empty";
import Camera from "./renderer/camera";
import { add, mult, scale } from "./lib/webgl/MV";
import { clamp, DEG_TO_RAD } from "./utils/math";
import treeGen, {
    grammar3,
    grammar5,
    grammar6,
    grammar7,
    grammar8,
    grammar9,
} from "./tree-gen";
// import Empty from "./shapes/empty";
import Shape from "./shapes/shape";
import Sphere from "./shapes/sphere";

const renderer = new Renderer();
let cursorLock = false;

const main = () => {
    const canvasElement = document.getElementById(
        "main-canvas"
    ) as HTMLCanvasElement;
    if (!canvasElement) console.error("Canvas element not found");

    canvasElement.addEventListener("click", canvasElement.requestPointerLock);

    document.addEventListener(
        "pointerlockchange",
        () => (cursorLock = document.pointerLockElement === canvasElement)
    );

    canvasElement.addEventListener(
        "mousemove",
        (e) =>
            cursorLock &&
            camera.mapRotation(([x, y, z]) => [
                clamp(x - e.movementY * 0.05, -90, 90),
                y - e.movementX * 0.05,
                z,
            ])
    );

    const gl = WebGLUtils.setupWebGL(canvasElement, null);

    if (!gl) console.error("GL not setup");

    gl.enable(gl.DEPTH_TEST);

    viewportSetup(gl, canvasElement);
    clearSetup(gl, [0.3, 0.3, 1, 1]);

    const program = loadShaders(gl, "vertex-shader", "fragment-shader");

    const camera = new Camera(0, 30, 60).setUpdate(({ deltaTime }, that) => {
        const {
            ShiftLeft = false,
            Space = false,
            KeyW = false,
            KeyA = false,
            KeyS = false,
            KeyD = false,
            ShiftRight = false,
            Digit1 = false,
            Backquote = false,
        } = pressedKeys;

        const xMove = scale(+KeyD + -KeyA, that.right);
        const yMove = scale(+Space + -ShiftLeft, Direction.up);
        const zMove = scale(+KeyS + -KeyW, [
            Math.sin(that.rotation[1] * DEG_TO_RAD),
            0,
            Math.cos(that.rotation[1] * DEG_TO_RAD),
        ]);
        const position = add(
            that.position,
            scale(
                deltaTime * (ShiftRight ? 12 : 3),
                add(xMove, add(yMove, zMove))
            )
        );

        that.setPosition(...(position as Vec3));

        if (Backquote) that.save();
        if (Digit1) that.load();
    });

    onResize(() => camera.updatePerspective(gl));

    const genBranches = (
        input: string,
        turtle: { location: Vec3; rotation: Vec3 },
        length: number,
        angle: number
    ) => {
        const clone = (turtle: { location: Vec3; rotation: Vec3 }) =>
            JSON.parse(JSON.stringify(turtle)) as {
                location: Vec3;
                rotation: Vec3;
            };

        const getDirection = (rotation: Vec3) =>
            mult(rotate(...rotation), [...Direction.up, 1]).slice(0, 3);

        const branches: Shape[] = [];
        const turtleStack: { location: Vec3; rotation: Vec3 }[] = [];
        for (let instruction of input) {
            switch (instruction) {
                // F: Move forward a step of length len, drawing a line (or cylinder) to the new point.
                case "F":
                    branches.push(
                        branch(length, turtle.rotation, turtle.location)
                    );

                    turtle.location = add(
                        turtle.location,
                        scale(length, getDirection(turtle.rotation))
                    ) as Vec3;
                    length = length * 0.995;
                    break;
                // f: Move forward a step of length len without drawing
                case "f":
                    turtle.location = add(
                        turtle.location,
                        scale(length, getDirection(turtle.rotation))
                    ) as Vec3;
                    break;
                // +: Apply a positive rotation about the X-axis of xrot degrees.
                case "+":
                    turtle.rotation[0] += angle;
                    break;
                // -: Apply a negative rotation about the X-axis of xrot degrees.
                case "-":
                    turtle.rotation[0] -= angle;
                    break;
                // &: Apply a positive rotation about the Y-axis of yrot degrees.
                case "&":
                    turtle.rotation[1] += angle;
                    break;
                // ^: Apply a negative rotation about the Y-axis of yrot degrees.
                case "^":
                    turtle.rotation[1] -= angle;
                    break;
                // \: Apply a positive rotation about the Z-axis of zrot degrees.
                case "\\":
                    turtle.rotation[2] += angle;
                    break;
                // /: Apply a negative rotation about the Z-axis of zrot degrees.
                case "/":
                    turtle.rotation[2] -= angle;
                    break;
                // |: Turn around 180 degrees.
                case "|":
                    turtle.rotation = turtle.rotation.map(
                        (x) => x + 180
                    ) as Vec3;
                    break;
                // [: Push the current state of the turtle onto a pushdown stack.
                case "[":
                    turtleStack.push(clone(turtle));
                    break;
                // ]: Pop the state from the top of the turtle stack, and make it the current turtle stack
                case "]":
                    if (turtleStack.length === 0) {
                        throw new Error("Turtle stack is Cube");
                    }
                    const newTurtle = turtleStack.pop();
                    if (newTurtle) turtle = newTurtle;
                    break;
            }
        }
        const tree = new Empty(0, 0, 0).setChildren(...branches);
        return tree;
    };

    const branch = (
        length: number,
        rotation: Vec3,
        location: Vec3 = [0, 0, 0]
    ) => {
        const rand = Math.random() * 10;
        const branchObject: Empty = new Empty(...location)
            .setChildren(
                Cylinder.singleRadius(
                    0.15 * Math.pow(length / 5, 3),
                    length,
                    10
                )
                    .setPosition(0, length / 2, 0)
                    .setRotation(90, 0, 0),
                new Cube(0, 0, 0)
                    .setScale(0.1, 2, 1)
                    .setPosition(0, length, 0)
                    .setRotation(45, 45, 0)
                    .setPostRender(({ frameCount }, that) =>
                        that.setRotation(
                            45 + (20 + rand) * Math.sin(frameCount + rand),
                            45 + (20 + rand) * Math.sin(frameCount + rand),
                            0
                        )
                    )
            )
            .setRotation(...rotation);
        return branchObject;
    };

    const n = 5;

    const turtle = {
        location: [0, 0, 0] as Vec3,
        rotation: [0, 0, 0] as Vec3,
    };
    const turtle2 = {
        location: [0, 0, 0] as Vec3,
        rotation: [0, 0, 0] as Vec3,
    };

    const tree1 = genBranches(treeGen(grammar6), turtle, n, 25.7);
    const tree2 = genBranches(treeGen(grammar7), turtle2, n, 22.5);
    const tree3 = genBranches(treeGen(grammar8), turtle2, n, 28);
    const tree4 = genBranches(treeGen(grammar9), turtle2, n, 22.5);
    const tree5 = genBranches(treeGen(grammar3), turtle2, n, 28);
    const tree6 = genBranches(treeGen(grammar5), turtle2, n, 22.5);

    new Empty(0, 0, 0)
        .setChildren(
            new Empty(0, 0, 0).setChildren(tree1).setRotation(0, 90, 0),
            new Empty(0, 0, 0)
                .setChildren(tree2)
                .setRotation(0, 90, 0)
                .setPosition(-25, 0, 0),
            new Empty(0, 0, 0)
                .setChildren(tree3)
                .setRotation(0, 90, 0)
                .setPosition(-50, 0, 0),
            new Empty(0, 0, 0)
                .setChildren(tree4)
                .setRotation(0, 90, 0)
                .setScale(1, 1, 1)
                .setPosition(-75, 0, 0),
            new Empty(0, 0, 0)
                .setChildren(tree5)
                .setRotation(0, 90, 0)
                .setPosition(-100, 0, 0),
            new Empty(0, 0, 0)
                .setChildren(tree6)
                .setRotation(0, 90, 0)
                .setScale(1, 1, 1)
                .setPosition(-125, 0, 0)
        )
        .build(renderer);

    renderer.setup(gl, program, camera);

    startTime = Date.now();
    lastRan = startTime;
    setupRender(gl, {
        tMatrixLoc: gl.getUniformLocation(program, "tMatrix"),
        tNormalMatrixLoc: gl.getUniformLocation(program, "tNormalMatrix"),
    });
};

let startTime = 0;
let lastRan = 0;

const setupRender = (
    gl: WebGLRenderingContext,
    payload: { [key: string]: any }
) => {
    setTimeout(() => {
        requestAnimationFrame(() => setupRender(gl, payload));
        const currTime = Date.now();
        render(
            gl,
            payload,
            (currTime - startTime) / 1000,
            (currTime - lastRan) / 1000
        );
        lastRan = currTime;
    }, 50);
};

const render = (
    gl: WebGLRenderingContext,
    payload: { [key: string]: any },
    timeElapsed: number,
    deltaTime: number
) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderer.render(
        gl,
        payload.tMatrixLoc,
        payload.tNormalMatrixLoc,
        timeElapsed,
        deltaTime
    );
};

onLoad(main);
