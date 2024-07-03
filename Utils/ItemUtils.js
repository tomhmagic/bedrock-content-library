export class ItemUtils{
    /**
     * Compares two ItemStacks to determine if they match exactly.
     * @param {ItemStack} itemStack The first ItemStack to compare.
     * @param {ItemStack} otherItemStack The second ItemStack to compare against.
     * @param {boolean} [compareAmount=false] Whether to compare the amount of items.
     * @returns {boolean} True if the ItemStacks match exactly, otherwise false.
     */
    static compareItemStacks(itemStack, otherItemStack, compareAmount = false){
        
        //ID and Name
        if(itemStack.typeId !== otherItemStack.typeId) return false;
        if(itemStack.nameTag !== otherItemStack.nameTag) return false;

        if(compareAmount){
            if (itemStack.amount !== otherItemStack.amount) return false;
        } else {
            //Check if they can simply stack
            if(itemStack.isStackable) return itemStack.isStackableWith(otherItemStack);
        }

        //Item Other NBT
        if (itemStack.keepOnDeath !== otherItemStack.keepOnDeath) return false;
        if (itemStack.lockMode !== otherItemStack.lockMode) return false;

        //Lore
        const itemStackLore = itemStack.getLore();
        const otherItemStackLore = otherItemStack.getLore();
        if (itemStackLore.length !== otherItemStackLore.length ||
            !itemStackLore.every((e, i) => e === otherItemStackLore[i])) return false;

        //Item Tags
        const itemStackTags = itemStack.getTags();
        const otherItemStackTags = otherItemStack.getTags();
        if (itemStackTags.length !== otherItemStackTags.length) return false;
        if (itemStackTags.length !== otherItemStackTags.length ||
            !itemStackTags.every((e, i) => e === otherItemStackTags[i])) return false;

        //Components
        const itemStackComponents = itemStack.getComponents();
        const otherItemStackComponents = otherItemStack.getComponents();
        if (itemStackComponents.length !== otherItemStackComponents.length) return false;
        for (let i = 0; i < itemStackComponents.length; i++) {
            const component = itemStackComponents[i];
            const otherComponent = otherItemStackComponents[i];
            switch (component.typeId) {
                case "minecraft:cooldown":
                    if(component.cooldownCategory !== otherComponent.cooldownCategory) return false;
                    if(component.cooldownTicks !== otherComponent.cooldownTicks) return false;
                    break;
                case "minecraft:durability":
                    if(component.damage !== otherComponent.damage) return false;
                    if(component.maxDurability !== otherComponent.maxDurability) return false;
                    break;
                case "minecraft:enchantable":
                    const enchants = component.getEnchantments();
                    const otherEnchants = otherComponent.getEnchantments();
                    if (enchants.length !== otherEnchants.length) return false;
                    if(enchants.length > 0){
                        for (let i = 0; i < enchants.length; i++) {
                            if (enchants[i].type !== otherEnchants[i].type) return false;
                            if (enchants[i].level !== otherEnchants[i].level) return false;
                        }
                    }
                    break;
                case "minecraft:food":
                    if(component.canAlwaysEat !== otherComponent.canAlwaysEat) return false;
                    if(component.nutrition !== otherComponent.nutrition) return false;
                    if(component.saturationModifier !== otherComponent.saturationModifier) return false;
                    if(component.usingConvertsTo !== otherComponent.usingConvertsTo) return false;
                    break;
                case "minecraft:potion":
                    if(component.potionEffectType.id !== otherComponent.potionEffectType.id) return false;
                    if(component.potionLiquidType.id !== otherComponent.potionLiquidType.id) return false;
                    if(component.potionModifierType.id !== otherComponent.potionModifierType.id) return false;
                    break;
            }
        }

        //Dynamic Properties
        const itemStackDPs = itemStack.getDynamicPropertyIds();
        const otherItemStackDPs = otherItemStack.getDynamicPropertyIds();
        if (itemStackDPs.length !== otherItemStackDPs.length) return false;

        for (const id of itemStackDPs) {
            const prop1 = itemStack.getDynamicProperty(id);
            const prop2 = otherItemStack.getDynamicProperty(id);
            if (typeof prop1 !== typeof prop2) return false;

            if (typeof prop1 === 'object' && prop1 !== undefined) return prop1.x == prop2.x && prop1.y == prop2.y && prop1.z == prop2.z;
            
            if (prop1 !== prop2) return false;
        }
        return true;
    }
}