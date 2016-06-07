import PathRecipe from "../PathRecipe";
﻿import GeneraterInfo from "../TextureGeneraters/BufferRecipe";
import BasicRenderer from "../BasicRenderer";
import ConfiguratorBase from "./RendererConfiguratorBase";
class DefaultRecipe extends ConfiguratorBase {
    public get TextureBuffers(): GeneraterInfo[] {
        return [
            {
                name: "depth",
                generater: "fit",
                layout: "RGB",
                format: "UBYTE"
            },
            {
                name: "gbuffer.primary",
                generater: "fit",
                layout: "RGBA",
                format: "UBYTE"
            },
            {
                name: "light.diffuse",
                generater: "fit",
                layout: "RGB",
                format: "UBYTE"
            },
            {
                name: "light.specular",
                generater: "fit",
                layout: "RGB",
                format: "UBYTE"
            },
            {
                name: "hitarea",
                generater: "fit",
                layout: "RGBA",
                format: "UBYTE"
            },
            {
                name: "main",
                generater: "fit",
                layout: "RGBA",
                format: "UBYTE"
            },
            {
                name: "output",
                generater: "fit",
                layout: "RGBA",
                format: "UBYTE"
            }
        ];
    }

    public getStageChain(target: BasicRenderer): PathRecipe[] {
        return [
            {
                buffers:
                {
                    OUT: "hitarea"
                },
                stage: "jthree.hitarea"
            },
            {
                buffers: {
                    DEPTH: "depth",
                    PRIMARY: "gbuffer.primary"
                },
                stage: "jthree.basic.gbuffer"
            },
            {
                buffers: {
                    DEPTH: "depth",
                    PRIMARY: "gbuffer.primary",
                    DIFFUSE: "light.diffuse",
                    SPECULAR: "light.specular"
                },
                stage: "jthree.basic.light"
            },
            {
                buffers: {
                    GBUFFER: "gbuffer.primary",
                    DLIGHT: "light.diffuse",
                    SLIGHT: "light.specular",
                    OUT: "output"
                },
                stage: "jthree.basic.foward"
            },
            {
                buffers: {
                    INPUT: "output",
                    OUT: "default"
                },
                stage: "jthree.basic.fxaa",
                variables: {
                    reduceMin: 0.05,
                    reduceMul: 0.1,
                    spanMax: 3
                }
            }];
        // },
        // {
        //   buffers: {
        //     MAIN: "main",
        //     PRIMARY: "gbuffer.primary",
        //     OUT: "output"
        //   },
        //   stage: "jthree.basic.fogExp2",
        //   variables: {
        //     density: 2.0,
        //   }
        // },
        // {
        //   buffers: {
        //     INPUT: "output",
        //     OUT: "default"
        //   },
        //   stage: "jthree.basic.fxaa",
        //   variables: {
        //     reduceMin: 0.05,
        //     reduceMul: 0.1,
        //     spanMax: 3
        //   }
        // }];
    }
}

export default DefaultRecipe;
