<template>
    <v-app>
        <LMap
            :zoom="17"
            :center="[
                53.4367995,
                34.2885255
            ]"
        >
            <LTileLayer
                url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            />
            <LMarker
                :lat-lng="[
                    53.4367995,
                    34.2885255
                ]"
            >
                <LTooltip>оз. Круглое</LTooltip>
            </LMarker>
        </LMap>
    </v-app>
</template>

<script>
import {
    LMap,
    LTileLayer,
    LMarker,
    LTooltip
} from 'vue2-leaflet';

export default {
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LTooltip
    }
}
</script>

<style>
@import url('leaflet/dist/leaflet.css');

.wrapper
{
    width: 100%;
    height: 100%;
}
</style>
