import { world, system } from "@minecraft/server";

import { config } from "./config";
import { showHexForm } from "./hexForm";
import { 
    getSaturValueAnimation, 
    getHueAnimation,
    getHue, 
    getSaturationAndValue,
    HSVtoRGB,
    faceLocationToVector2,
    RGBtoHEX,
    HEXtoHSV,
    getHEXValues
} from "./conversions";

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity: player, hitEntity: target }) => {
    const hitType = target.typeId;

    if(player.typeId !== config.ENTITY_TYPES.player) return;

    if(hitType === config.ENTITY_TYPES.colour_picker){
        player.playSound(config.SOUNDS.hexButtonSound);
        showHexForm(player, target);
        target.playAnimation(config.ANIMATIONS.hexButton);
    }

    if(hitType === config.ENTITY_TYPES.submitButton){
        player.playSound(config.SOUNDS.submitButtonSound);

        const colourPickerEntity = getColourPickerEntityFromButton(target);

        if(colourPickerEntity !== null){
            target.playAnimation(config.ANIMATIONS.submitButton);
            config.submitColour(player, colourPickerEntity);
        }        
    }

});

world.afterEvents.itemUseOn.subscribe((event ) => {
    const {block, blockFace, faceLocation, itemStack, source} = event;
    
    if(source.typeId !== config.ENTITY_TYPES.player || itemStack.typeId !== config.ENTITY_TYPES.colour_picker) return;

    if(blockFace === "Up" || blockFace === "Down") return;

    const colourPickerEntitys = world.getDimension(source.dimension.id).getEntities({closest: 1, location:block.location, minDistance: 0, maxDistance: 2});

    if(colourPickerEntitys.length === 0 ) return;
    
    const colourPickerEntity = colourPickerEntitys[0];

    const dimension = world.getDimension(colourPickerEntity.dimension.id);

    const SaturationAndValueInputBlock = dimension.getBlock(getSatValBlockLocation(colourPickerEntity.location, blockFace));
    if(!SaturationAndValueInputBlock) return;

    const HueInputBlock = dimension.getBlock(getHueBlockLocation(colourPickerEntity.location, blockFace));
    if(!HueInputBlock) return;   

    if(block.location.x === SaturationAndValueInputBlock.location.x &&
        block.location.y === SaturationAndValueInputBlock.location.y &&
        block.location.z === SaturationAndValueInputBlock.location.z
    ){
        const SV = getSaturationAndValue(blockFace, faceLocation);
        source.playSound(config.SOUNDS.pallet);
        setSaturationAndValue(SV, colourPickerEntity);
    }

    const interactY = faceLocationToVector2(blockFace, faceLocation).y;
    if(block.location.x === HueInputBlock.location.x &&
        block.location.y === HueInputBlock.location.y &&
        block.location.z === HueInputBlock.location.z && 
        interactY >= 60
    ){
        const hue = getHue(blockFace, faceLocation);
        source.playSound(config.SOUNDS.hue);
        setHue(hue, colourPickerEntity);
    }

});

export function hexFormReturn(hex, colourPickerEntity){

    setHEX(hex, colourPickerEntity);

    const HSV = HEXtoHSV(hex);
    setHue(HSV.h, colourPickerEntity);
    setSaturationAndValue({saturation: HSV.s, value: HSV.v }, colourPickerEntity);

}

function getColourPickerEntityFromButton(buttonEntity){
    const entityID = buttonEntity.getDynamicProperty(config.DYNAMIC_PROPORTIES.colourPickerEntityID);
    if(!entityID){
        world.sendMessage("§cERROR: §rNo entity ID saved to submit button. Did you use the command to spawn it in?");
        return null;
    }

    const colourPickerEntity = world.getEntity(entityID);

    if(!colourPickerEntity){
        world.sendMessage(`§cERROR: §rCannot find eneity with ID: ${entityID}. Is it still in the world?`);
        return null;
    }

    return colourPickerEntity;
}

function setHue(hue, colourPickerEntity){
    const storedHSV = config.getStoredHSV(colourPickerEntity);
    const hsvVector = {x: hue, y: storedHSV.s, z: storedHSV.v};

    colourPickerEntity.setDynamicProperty(config.DYNAMIC_PROPORTIES.hsv, hsvVector);

    const hueAnimValue = getHueAnimation(hue);

    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.anim_hue, parseFloat(hueAnimValue));

    const coreRGB = HSVtoRGB(hue, 100, 100);
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.core_colour_r, parseInt(coreRGB.r));
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.core_colour_g, parseInt(coreRGB.g));
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.core_colour_b, parseInt(coreRGB.b));

    const RGB = HSVtoRGB(hsvVector.x, hsvVector.y, hsvVector.z);
    setRGB(RGB, colourPickerEntity);

}

function setSaturationAndValue(SV, colourPickerEntity){
    const storedHSV = config.getStoredHSV(colourPickerEntity);
    const hsvVector = {x: storedHSV.h, y: SV.saturation, z: SV.value};
    
    colourPickerEntity.setDynamicProperty(config.DYNAMIC_PROPORTIES.hsv, hsvVector);
    
    const SatValAnimValue = getSaturValueAnimation(SV.saturation, SV.value);

    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.anim_sat, SatValAnimValue.saturation);
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.anim_val, SatValAnimValue.value);

    const RGB = HSVtoRGB(hsvVector.x, hsvVector.y, hsvVector.z);
    setRGB(RGB, colourPickerEntity);
}

function setRGB(value, colourPickerEntity){
    
    colourPickerEntity.setDynamicProperty(config.DYNAMIC_PROPORTIES.rgb, {x:value.r, y:value.g, z:value.b});
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.r, value.r);
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.g, value.g);
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.b, value.b);
    const HEX = RGBtoHEX(value.r, value.g, value.b);
    setHEX(HEX, colourPickerEntity);
}

function setHEX(HEX, colourPickerEntity){
    colourPickerEntity.setDynamicProperty(config.DYNAMIC_PROPORTIES.hex, HEX);

    const HEX_VALUES = getHEXValues(HEX);

    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.digit_0, HEX_VALUES[0]);
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.digit_1, HEX_VALUES[1]);
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.digit_2, HEX_VALUES[2]);
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.digit_3, HEX_VALUES[3]);
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.digit_4, HEX_VALUES[4]);
    colourPickerEntity.setProperty(config.ACTOR_PROPERTIES.digit_5, HEX_VALUES[5]);
}

function getSatValBlockLocation(loc, blockFace) {
    let location = {x:Math.floor(loc.x), y:Math.floor(loc.y), z:Math.floor(loc.z)};
    location.y++;

    const faceMovements = {
        "North": { x: 0, z: 1 },
        "East": { x: -1, z: 0 },
        "South": { x: 0, z: -1 },
        "West": { x: 1, z: 0 }
    };

    if (faceMovements[blockFace]) {
        location.x += faceMovements[blockFace].x;
        location.z += faceMovements[blockFace].z;
    } 

    return location;
}

function getHueBlockLocation(loc, blockFace){
    let location = {x:Math.floor(loc.x), y:Math.floor(loc.y), z:Math.floor(loc.z)};

    const faceMovements = {
        "North": { x: 0, z: 1 },
        "East": { x: -1, z: 0 },
        "South": { x: 0, z: -1 },
        "West": { x: 1, z: 0 }
    };

    if (faceMovements[blockFace]) {
        location.x += faceMovements[blockFace].x;
        location.z += faceMovements[blockFace].z;
    }

    return location;
}


system.afterEvents.scriptEventReceive.subscribe((event) => {
    const {
        id,          
        initiator,
        message,  
        sourceBlock,  
        sourceEntity, 
        sourceType, 
    } = event;

    if(!isValidCommand(id)) return;

    const dimension = world.getDimension(sourceEntity.dimension.id);
    let direction = 0;
    
    switch (id) { //inverted to face that direction
        case config.SCRIPT_EVENTS.spawnNorth:
            direction = 180;
            break;
        case config.SCRIPT_EVENTS.spawnEast:
            direction = 270;
            break;
        case config.SCRIPT_EVENTS.spawnSouth:
            direction = 0;
            break;
        case config.SCRIPT_EVENTS.spawnWest:
            direction = 90;
            break;
    }

    const block = sourceEntity.getBlockFromViewDirection().block;
    if(!block){
        sourceEntity.sendMessage("§cERROR: §rNo block found to spawn colour picker, please look at the block you want it to spawn on top off")
    }

    const location = {x: block.x + 0.5, y: block.y + 1, z: block.z + 0.5};

    spawnColourPicker(dimension, location, direction, sourceEntity);

  });

function spawnColourPicker(dimension, location, direction, player){
    let colourPicker = dimension.spawnEntity(config.ENTITY_TYPES.colour_picker, location);
    let submitButton = dimension.spawnEntity(config.ENTITY_TYPES.submitButton, location);

    const rot = {x:direction, y:0};
    colourPicker.setRotation(rot);
    submitButton.setRotation(rot);

    submitButton.setDynamicProperty(config.DYNAMIC_PROPORTIES.colourPickerEntityID, colourPicker.id);

    setHue(config.DEFAULT_COLOUR.hsv.h, colourPicker);
    setSaturationAndValue({saturation: config.DEFAULT_COLOUR.hsv.s, value: config.DEFAULT_COLOUR.hsv.v}, colourPicker);

    player.sendMessage("§aSummond Colour Picker and Submit Button§r");
}

function isValidCommand(string){
    for (const key in config.SCRIPT_EVENTS) {
        if (config.SCRIPT_EVENTS[key] === string) {
            return true;
        }
    }
    return false;
}