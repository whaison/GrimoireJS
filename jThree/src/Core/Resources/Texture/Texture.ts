import TextureWrapper = require('./TextureWrapper');
import ContextManagerBase = require('../../ContextManagerBase');
import JThreeContext = require('../../JThreeContext');
import TextureBase =require('./TextureBase');
import TextureWrapperBase = require('./TextureWrapperBase');
type ImageSource = HTMLCanvasElement|HTMLImageElement|ImageData|ArrayBufferView;

class Texture extends TextureBase
{
  constructor(context:JThreeContext,source:ImageSource)
  {
    super(context);
    this.imageSource=source;
  }
  
  private imageSource:ImageSource=null;

  public get ImageSource():ImageSource
  {
    return this.imageSource;
  }

  public set ImageSource(img:ImageSource)
  {
    this.imageSource=img;
    this.each((v)=>(<TextureWrapper>v).init(true));
    this.generateMipmapIfNeed();
  }

  protected getInstanceForRenderer(contextManager: ContextManagerBase):TextureWrapperBase {
      var textureWrapper=new TextureWrapper(contextManager,this);
      return textureWrapper;
  }
  
}

export = Texture;
