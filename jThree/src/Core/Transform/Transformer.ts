import Quaternion = require("../../Math/Quaternion");
import Vector3 = require("../../Math/Vector3");
import Matrix = require("../../Math/Matrix");
import SceneObject = require("../SceneObject");
import JThreeObject = require("../../Base/JThreeObject");
import Delegates = require("../../Base/Delegates");
import glm = require("glm");
import RendererBase = require("./../Renderers/RendererBase");
import JThreeEvent = require("./../../Base/JThreeEvent");
/**
 * Position,rotation and scale of scene object.
 * Every scene object in a scene has Toransformer.It's used to store and manipulate the position,rotation and scale ob the object.
 * Every Transformer can have a parent, each parent Transformer affect children's Transformer hierachically.
 */
class Transformer extends JThreeObject
{
    /**
     * Constructor of Transformer
     * @param sceneObj the scene object this transformer attached to.
     */
    constructor(sceneObj: SceneObject)
    {
        super();
        this.relatedTo = sceneObj;
        this.position = Vector3.Zero;
        this.rotation = Quaternion.Identity;
        this.scale = new Vector3(1, 1, 1);
        this.localOrigin = new Vector3(0, 0, 0);
        this.foward = new Vector3(0, 0, -1);
        this.updateTransform();
    }
    /**
     * Scene oject reference this transformer related to.
     */
    private relatedTo: SceneObject;
  
    /**
     * backing field of Rotation.
     */
    private rotation: Quaternion;
  
    /**
     * backing field of Position.
     */
    private position: Vector3;

    private localOrigin: Vector3;
  
    /**
     * backing field of Scale.
     */
    private scale: Vector3;
  
    /**
     * backing filed of Foward.
     */
    private foward: Vector3;

    /**
     * backing field of LocalTransform.
     */
    private localTransform: Matrix;

    /**
     * backing field of LocalToGlobal
     */
    private localToGlobal: Matrix;
  
    /**
     * calculation cache
     */
    private localTransformCache: glm.GLM.IArray = glm.mat4.create();

    private localToGlobalCache: glm.GLM.IArray = glm.mat4.create();

    private modelViewProjectionCaluculationCache = glm.mat4.create();

    private fowardCache: glm.GLM.IArray = glm.vec3.create();

    private cacheVec: glm.GLM.IArray = glm.vec4.create();
  
    /**
     * properties for storeing event handlers
     */
    private onUpdateTransformHandler: JThreeEvent<SceneObject> = new JThreeEvent<SceneObject>();

    /**
     * Subscribe event handlers it will be called when this transformer's transform was changed.
     * @param action the event handler for this event.
     */
    public onUpdateTransform(action: Delegates.Action2<Transformer, SceneObject>): void
    {
        this.onUpdateTransformHandler.addListerner(action);
    }

    /**
     * update all transform
     * You no need to call this method manually if you access all of properties in this transformer by accessor.
     */
    public updateTransform(): void
    {
        //initialize localTransformCache & localToGlobalCache
        glm.mat4.identity(this.localTransformCache);
        glm.mat4.identity(this.localToGlobalCache);
        glm.mat4.fromRotationTranslationScaleOrigin(this.localTransformCache, this.rotation.targetQuat, this.position.targetVector, this.Scale.targetVector, this.localOrigin.targetVector);//substitute Rotation*Translation*Scale matrix (around local origin) for localTransformCache 
        this.localTransform = new Matrix(this.localTransformCache);//Generate Matrix instance and substitute the matrix for localTransform
        if (this.relatedTo != null && this.relatedTo.Parent != null)
        {
            //Use LocalToGlobal matrix of parents to multiply with localTransformCache
            glm.mat4.copy(this.localToGlobalCache, this.relatedTo.Parent.Transformer.LocalToGlobal.rawElements);
        } else
        {
            //If this transformer have no parent transformer,localToGlobalCache,GlobalTransform will be same as localTransformCache
            glm.mat4.identity(this.localToGlobalCache);
        }
        //Multiply parent transform
        this.localToGlobal = new Matrix(glm.mat4.multiply(this.localToGlobalCache, this.localToGlobalCache, this.localTransform.rawElements));
        //Calculate forward direction vector
        glm.vec4.transformMat4(this.cacheVec, this.localToGlobalCache, [0, 0, 1, 0]);
        glm.vec3.normalize(this.fowardCache, this.cacheVec);
        //notify update to childrens
        if (this.relatedTo.Children) this.relatedTo.Children.each((v) =>
        {
            v.Transformer.updateTransform();
        });
        //fire updated event
        this.onUpdateTransformHandler.fire(this, this.relatedTo);
    }

    /**
     * Calculate Projection-View-Model matrix with renderer camera.
     */
    public calculateMVPMatrix(renderer: RendererBase): Matrix
    {
        glm.mat4.mul(this.modelViewProjectionCaluculationCache, renderer.Camera.ViewMatrix.RawElements, this.LocalToGlobal.RawElements);
        glm.mat4.mul(this.modelViewProjectionCaluculationCache, renderer.Camera.ProjectionMatrix.RawElements, this.modelViewProjectionCaluculationCache);
        return new Matrix(this.modelViewProjectionCaluculationCache);
    }
    /**
     * Get accessor for the direction of foward of this model.
     */
    public get Foward(): Vector3
    {
        return this.foward;
    }
    /**
     * Get accessor for the matrix providing the transform Local space into Global space.
     */
    public get LocalToGlobal(): Matrix
    {
        return this.localToGlobal;
    }
    /**
     * Get accessor for model rotation.
     */
    public get Rotation(): Quaternion
    {
        return this.rotation;
    }
    /**
     * Set accessor for model rotation.
     */
    public set Rotation(quat: Quaternion)
    {
        this.rotation = quat;
        this.updateTransform();
    }
    /**
     * Get Accessor for model position.
     */
    public get Position(): Vector3
    {
        return this.position;
    }
    /**
     * Set Accessor for model position.
     */
    public set Position(vec: Vector3)
    {
        this.position = vec;
        this.updateTransform();
    }
  
    /**
     * Get Accessor for model scale.
     */
    public get Scale(): Vector3
    {
        return this.scale;
    }
  
    /**
     * Set Accessor for model scale.
     */
    public set Scale(vec: Vector3)
    {
        this.scale = vec;
        this.updateTransform();
    }

    public get LocalOrigin(): Vector3
    {
        return this.localOrigin;
    }

    public set LocalOrigin(origin: Vector3)
    {
        this.localOrigin = origin;
        this.updateTransform();
    }
}

export =Transformer;
