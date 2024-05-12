import { ModalFormData } from "@minecraft/server-ui";

import { config } from "./config";
import { isValidHex } from "./conversions";
import { hexFormReturn } from "./index";

export function showHexForm(player, colourPickerEntity){
    let form = new ModalFormData();

    form.title({translate: config.LANG_STRINGS.hex_form_title});
    form.textField({translate: config.LANG_STRINGS.hex_form_input},{translate: config.LANG_STRINGS.hex_form_preview});


    form.show(player).then(responce => {
        if (responce.canceled) return;

        recieveFormReturn(responce.formValues[0], colourPickerEntity, player)

    }).catch(e => {
        console.error(e, e.stack);
    });
}


function recieveFormReturn(value, colourPickerEntity, player){
    if(!isValidHex(value)){
        player.sendMessage({translate: config.LANG_STRINGS.hex_error});
        return;
    }

    hexFormReturn(value.toUpperCase(), colourPickerEntity);
}