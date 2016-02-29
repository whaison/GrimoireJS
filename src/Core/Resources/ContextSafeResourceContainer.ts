import IDisposable from "../../Base/IDisposable";
import JThreeObjectWithID from "../../Base/JThreeObjectWithID";
import Canvas from "../Canvas/Canvas";
import {Action1} from "../../Base/Delegates";
import {AbstractClassMethodCalledException} from "../../Exceptions";
import CanvasListChangedEventArgs from "../Canvas/ICanvasListChangedEventArgs";
import ResourceWrapper from "./ResourceWrapper";
import JThreeContext from "../../JThreeContext";
import CanvasManager from "../Canvas/CanvasManager";
import ContextComponents from "../../ContextComponents";
/**
 * Provides context difference abstraction.
 */
class ContextSafeResourceContainer<T extends ResourceWrapper> extends JThreeObjectWithID implements IDisposable {

  public name: string;

  private _childWrapper: { [key: string]: T } = {};

  private _wrapperLength: number = 0;

  constructor() {
    super();
    const canvasManager = JThreeContext.getContextComponent<CanvasManager>(ContextComponents.CanvasManager);
    // Initialize resources for the renderers already subscribed.
    canvasManager.canvasListChanged.addListener(this._rendererChanged.bind(this));
  }

  public dispose(): void {
    this.each((e) => {
      e.dispose();
    });
  }

  public get wrappers(): T[] {
    const array = new Array(this._wrapperLength);
    let index = 0;
    this.each((elem) => {
      array[index] = elem;
      index++;
    });
    return array;
  }

  public getForContext(canvas: Canvas): T {
    return this.getForContextID(canvas.ID);
  }

  public getForContextID(id: string): T {
    if (!this._childWrapper[id]) {
      console.log("There is no matching object with the ID:" + id);
    }
    return this._childWrapper[id];
  }

  public each(act: Action1<T>): void {
    for (let key in this._childWrapper) {
      act(this._childWrapper[key]);
    }
  }

  protected __createWrapperForCanvas(canvas: Canvas): T {
    throw new AbstractClassMethodCalledException();
  }

  protected __initializeForFirst(): void {
    const canvasManager = JThreeContext.getContextComponent<CanvasManager>(ContextComponents.CanvasManager);
    canvasManager.canvases.forEach((v) => {
      this._childWrapper[v.ID] = this.__createWrapperForCanvas(v);
      this._wrapperLength++;
    });
  }

  private _rendererChanged(object: any, arg: CanvasListChangedEventArgs): void {
    if (arg.isAdditionalChange) {
      this._childWrapper[arg.canvas.ID] = this.__createWrapperForCanvas(arg.canvas);
      this._wrapperLength++;
    } else { // TODO should be tested
      const delTarget: T = this._childWrapper[arg.canvas.ID];
      delete this._childWrapper[arg.canvas.ID];
      delTarget.dispose();
      this._wrapperLength--;
    }
  }

}

export default ContextSafeResourceContainer;
