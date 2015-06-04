import JThreeObject = require("../../../Base/JThreeObject");
import Program = require("./Program");
import ContextManagerBase = require("../../ContextManagerBase");
import GLContextWrapperBase = require("../../../Wrapper/GLContextWrapperBase");
import Matrix = require("../../../Math/Matrix");
import BufferWrapper = require("../Buffer/BufferWrapper");
import VectorBase = require("../../../Math/VectorBase");
import Vector2 = require("../../../Math/Vector2");
import Vector3 = require("../../../Math/Vector3");
import Vector4 = require("../../../Math/Vector4");
import ResourceWrapper = require('../ResourceWrapper');
import AssociativeArray = require('../../../Base/Collections/AssociativeArray');
class ProgramWrapper extends ResourceWrapper
{
   constructor(parent:Program,contextManager:ContextManagerBase) {
       super(contextManager);
       this.parentProgram = parent;
   }

   private initialized: boolean = false;

   private isLinked:boolean=false;

   private targetProgram: WebGLProgram = null;

   private parentProgram: Program = null;

   private attributeLocations: AssociativeArray<number> = new AssociativeArray<number>();

   private uniformLocations:AssociativeArray<WebGLUniformLocation>=new AssociativeArray<WebGLUniformLocation>();

   get TargetProgram(): WebGLProgram {
       return this.targetProgram;
   }

   init(): void {
       if (!this.initialized) {
           this.targetProgram = this.WebGLContext.CreateProgram();
           this.parentProgram.AttachedShaders.forEach((v, i, a) => {
               this.WebGLContext.AttachShader(this.targetProgram, v.getForRendererID(this.OwnerID).TargetShader);
           });
           this.initialized = true;
       }
   }

   dispose() {
       if (this.initialized) {
           this.WebGLContext.DeleteProgram(this.targetProgram);
           this.initialized = false;
           this.targetProgram = null;
           this.isLinked = false;
       }
   }

   linkProgram(): void {
       if (!this.isLinked) {
           this.WebGLContext.LinkProgram(this.targetProgram);
           this.isLinked = true;
       }
   }

   useProgram(): void
   {
       if (!this.initialized) {
           console.log("useProgram was called, but program was not initialized.");
           this.init();
       }
       if (!this.isLinked)
       {
           console.log("useProgram was called, but program was not linked.");
           this.linkProgram();
       }
       this.WebGLContext.UseProgram(this.targetProgram);
   }

   setUniformMatrix(valName: string, matrix: Matrix): void {
       this.useProgram();
       if (!this.uniformLocations.has(valName))
       {
           this.uniformLocations.set(valName, this.WebGLContext.GetUniformLocation(this.TargetProgram, valName));
       }
       var uniformIndex: WebGLUniformLocation = this.uniformLocations.get(valName);
       this.WebGLContext.UniformMatrix(uniformIndex,matrix);
   }

   setUniform1i(valName:string,num:number):void
   {
     this.useProgram();
     if (!this.uniformLocations.has(valName))
     {
         this.uniformLocations.set(valName, this.WebGLContext.GetUniformLocation(this.TargetProgram, valName));
     }
     var uniformIndex: WebGLUniformLocation = this.uniformLocations.get(valName);
     this.WebGLContext.Uniform1i(uniformIndex,num);
   }

   setUniformVector(valName:string,vec:VectorBase):void
   {
     this.useProgram();
     if (!this.uniformLocations.has(valName))
     {
         this.uniformLocations.set(valName, this.WebGLContext.GetUniformLocation(this.TargetProgram, valName));
     }
     var uniformIndex: WebGLUniformLocation = this.uniformLocations.get(valName);
     switch(vec.ElementCount)
     {
       case 2:
         this.WebGLContext.UniformVector2(uniformIndex,<Vector2>vec);
         break;
         case 3:
           this.WebGLContext.UniformVector3(uniformIndex,<Vector3>vec);
        break;
        case 4:
          this.WebGLContext.UniformVector4(uniformIndex,<Vector4>vec);
          break;
     }
   }

   setAttributeVerticies(valName: string, buffer: BufferWrapper): void {
       this.useProgram();
       buffer.bindBuffer();
       if (!this.attributeLocations.has(valName)) {
           this.attributeLocations.set(valName, this.WebGLContext.GetAttribLocation(this.TargetProgram, valName));
       }
       var attribIndex: number = this.attributeLocations.get(valName);
       this.WebGLContext.EnableVertexAttribArray(attribIndex);
       this.WebGLContext.VertexAttribPointer(attribIndex, buffer.UnitCount, buffer.ElementType,buffer.Normalized,buffer.Stride,buffer.Offset);
   }

}

export=ProgramWrapper;
