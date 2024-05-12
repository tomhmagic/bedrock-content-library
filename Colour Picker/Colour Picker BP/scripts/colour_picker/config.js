//Config options if you want to change some references or sounds. 
//DYNAMIC_PROPORTIES, SOUNDS and LANG_STRINGS are the main ones you might want to change, 
//others require changes to other files.
import { HEXtoRGB, HEXtoHSV } from "./conversions";

export class config {
    static DEFAULT_COLOUR = {
        hex: "FF0000", // Only change this value
        rgb:{},
        hsv:{}
    };

    //Init rgb and hsv default colours from the set hex.
    static initializeDefaultColour() {
        this.DEFAULT_COLOUR.rgb = HEXtoRGB(this.DEFAULT_COLOUR.hex);
        this.DEFAULT_COLOUR.hsv = HEXtoHSV(this.DEFAULT_COLOUR.rgb);
    }
    
    static DYNAMIC_PROPORTIES = {
        hsv: "colour_hsv", //Vector3 for saving HSV
        rgb: "colour_rgb", //Vector3 for saving RGB
        hex: "colour_hex", //String for saving Hex code
        colourPickerEntityID: "picker_entity_id" //stores the entity ID of the spawned colour picker entity
    };
    static SOUNDS = {
        hexButtonSound: "random.click", //sound for clicking the input hex button
        submitButtonSound: "random.click", //sound for clicking the submit button
        pallet: "item.spyglass.stop_using", //sound for when clicking the main selector
        hue: "item.spyglass.use" //sound for when clicking the hue selector
    };
    static LANG_STRINGS = {
        hex_error: "colour_picker.form.hex.error",
        hex_form_title: "colour_picker.form.hex.title",
        hex_form_input: "colour_picker.form.hex.input",
        hex_form_preview: "colour_picker.form.hex.input.preview"
    };

    static ENTITY_TYPES = {
        player: "minecraft:player", //Don't touch this
        colour_picker: "tomhmagic:colour_picker", //Only change if you change the colour picker entity
        submitButton: "tomhmagic:colour_picker_submit" //Only change if you change the colour picker submit entity
    };
    static ANIMATIONS = {
        hexButton: "animation.colour_picker.button",
        submitButton: "animation.colour_picker_submit.press"
    }
    static ACTOR_PROPERTIES = {
        //Colour picker properties. Only change if you change the colour picker entity
        r: "property:colour_r",
        g: "property:colour_g",
        b: "property:colour_b",
        core_colour_r: "property:core_colour_r",
        core_colour_g: "property:core_colour_g",
        core_colour_b: "property:core_colour_b",
        digit_0: "property:digit_0",
        digit_1: "property:digit_1",
        digit_2: "property:digit_2",
        digit_3: "property:digit_3",
        digit_4: "property:digit_4",
        digit_5: "property:digit_5",
        anim_hue: "property:anim_hue",
        anim_sat: "property:anim_sat",
        anim_val: "property:anim_val"
        // --- Colour picker properties --- 
    };

    static SCRIPT_EVENTS = {
        spawnNorth: "spawnpicker:north",
        spawnEast: "spawnpicker:east",
        spawnSouth: "spawnpicker:south",
        spawnWest: "spawnpicker:west"
    }

    //This method is called once all conversions are done, and data saved. You can change this to what you need it to do. 
    //It takes in the player that interacted with the submit button and the entity that stores all the colour values.
    static submitColour(player, colourPickerEntity){
        const RGB = this.getStoredRGB(colourPickerEntity);
        const HSV = this.getStoredHSV(colourPickerEntity);
        const HEX = this.getStoredHEX(colourPickerEntity);

        const message = `Output:
        \nRGB = ${RGB.r} ${RGB.g} ${RGB.b}
        \nHSV = ${HSV.h} ${HSV.s} ${HSV.v}
        \nHEX = ${HEX}
        `

        player.sendMessage(message);

    }


    //Getters, don't change these, you can use them in submitColour().
    static getStoredRGB(colourPickerEntity){
        let RGB = {r: 0, g: 0, b: 0};
        const savedRGB = colourPickerEntity.getDynamicProperty(this.DYNAMIC_PROPORTIES.rgb);

        if(savedRGB){
            RGB.r = savedRGB.x;
            RGB.g = savedRGB.y;
            RGB.b = savedRGB.z;
        }
        return RGB;
    }

    static getStoredHSV(colourPickerEntity){
        let HSV = {h: 0, s: 0, v: 0};
        const savedHSV = colourPickerEntity.getDynamicProperty(this.DYNAMIC_PROPORTIES.hsv);

        if(savedHSV){
            HSV.h = savedHSV.x;
            HSV.s = savedHSV.y;
            HSV.v = savedHSV.z;
        }
        return HSV;
    }

    static getStoredHEX(colourPickerEntity) {
        const savedHEX = colourPickerEntity.getDynamicProperty(this.DYNAMIC_PROPORTIES.hex);
        return savedHEX ?? this.DEFAULT_COLOUR;
    }
    
}

// Calls the method to initialize DEFAULT_COLOUR
config.initializeDefaultColour();