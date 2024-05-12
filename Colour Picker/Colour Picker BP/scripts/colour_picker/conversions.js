import { world } from "@minecraft/server";

export function getSaturationAndValue(blockFace, faceLocation){
    const vector2 = faceLocationToVector2(blockFace, faceLocation);
    return {saturation:vector2.x, value:vector2.y};
}

export function getHue(blockFace, faceLocation){
    const vector2 = faceLocationToVector2(blockFace, faceLocation);
    return mapValueToHue(vector2.x);
}

export function HSVtoRGB(h, s, v) {
    // Ensure inputs are within valid range
    h = (h < 0) ? 0 : (h >= 360) ? 359.99 : h;
    s = (s < 0) ? 0 : (s > 100) ? 100 : s;
    v = (v < 0) ? 0 : (v > 100) ? 100 : v;

    // Convert HSV to RGB
    var c = v * s / 100,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = v - c;

    var r, g, b;
    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }

    // Adjust RGB values and return as integers
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r: Math.floor(r / 100), g: Math.floor(g / 100), b: Math.floor(b / 100)};
}

export function RGBtoHSV(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h, s, v;
    v = max;

    if (max === 0) {
        s = 0;
    } else {
        s = (max - min) / max;
    }

    if (max === min) {
        h = 0;
    } else {
        const delta = max - min;
        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }
        h = Math.round(h * 60);
        if (h < 0) h += 360;
    }

    s = Math.floor(s * 100);
    v = Math.floor(v * 100);

    return { h, s, v };
}

export function RGBtoHEX(r, g, b) {
    // Ensure RGB values are within valid range
    r = Math.round(Math.max(0, Math.min(255, r)));
    g = Math.round(Math.max(0, Math.min(255, g)));
    b = Math.round(Math.max(0, Math.min(255, b)));

    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export function HEXtoRGB(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return { r: r, g: g, b: b };
}

export function HEXtoHSV(hex){
    const RGB = HEXtoRGB(hex);
    return RGBtoHSV(RGB.r, RGB.g, RGB.b);
}

export function getHEXValues(hex) {
    const hexValues = [];
    for (let i = 0; i < hex.length; i++) {
        const char = hex.charAt(i);
        let value;
        if (char >= '0' && char <= '9') {
            value = parseInt(char);
        } else if (char >= 'A' && char <= 'F') {
            value = char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        } else if (char >= 'a' && char <= 'f') {
            value = char.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
        } else {
            console.error("Invalid hex string passed to getHEXValues() in conversions.js");
        }
        hexValues.push(value);
    }
    return hexValues;
}

export function isValidHex(hex) {
    let hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    return hexRegex.test(hex);
}

export function getHueAnimation(value) {
    const minInput = 0;
    const maxInput = 360;
    const minOutput = 0;
    const maxOutput = 15;

    // Map the value from the input range to the output range
    let mappedValue = minOutput + (maxOutput - minOutput) * ((value - minInput) / (maxInput - minInput));

    return parseFloat(mappedValue.toFixed(2));
}

export function getSaturValueAnimation(saturation, value) {
    const minInput = 0;
    const maxInput = 100;
    const minOutput = 0;
    const maxOutput = 15;

    // Map the saturation and value from the input range to the output range
    let mappedSaturation = minOutput + (maxOutput - minOutput) * ((saturation - minInput) / (maxInput - minInput));
    let mappedValue = minOutput + (maxOutput - minOutput) * ((value - minInput) / (maxInput - minInput));

    // Convert the mapped values to floats
    mappedSaturation = parseFloat(mappedSaturation.toFixed(2));
    mappedValue = parseFloat(mappedValue.toFixed(2));

    return { saturation: mappedSaturation, value: mappedValue };
}


export function faceLocationToVector2(blockFace, faceLocation){
    const LOCATION_VECTOR = {x: (faceLocation.x * 100), y: (faceLocation.y * 100), z: (faceLocation.z * 100)};
    let output = {x: 0, y: 0};
    switch (blockFace) {
        case "North":
            output.y = LOCATION_VECTOR.x;
            output.x = invertValue(LOCATION_VECTOR.y);
            break;
        case "East":
            output.y = LOCATION_VECTOR.y;
            output.x = invertValue(LOCATION_VECTOR.z);
            break;
        case "South":
            output.x = LOCATION_VECTOR.x;
            output.y = LOCATION_VECTOR.y;
            break;
        case "West":
            output.y = LOCATION_VECTOR.y;
            output.x = LOCATION_VECTOR.z;
            break;
    }

    return {x: Math.floor(output.x), y: Math.floor(output.y)};
}


function invertValue(value) {
    return value === 0 ? 100 : 100 - value;
}

function mapValueToHue(value) {
    const minInput = 0;
    const maxInput = 1;
    const minOutput = 0;
    const maxOutput = 360;
    //change inputed satuation (0-100) to a hue of 0 - 360 floored
    return Math.floor((minOutput + (maxOutput - minOutput) * ((value - minInput) / (maxInput - minInput))) / 100);
}

