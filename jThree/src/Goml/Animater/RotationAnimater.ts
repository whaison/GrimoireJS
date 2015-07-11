import JThreeObject = require("../../Base/JThreeObject");
import GomlAttribute = require("../GomlAttribute");
import EasingFunctionBase = require("../Easing/EasingFunctionBase");
import Delegates = require("../../Base/Delegates");
import AnimagterBase = require("./AnimaterBase");
import Vector3 = require("../../Math/Vector3");
import Quaternion = require("../../Math/Quaternion");
class RotationAnimater extends AnimagterBase
{

  protected updateAnimation(progress:number):void
  {
    var b=<Quaternion>this.beginValue;
    var e=<Quaternion>this.endValue;
    var ef=this.easingFunction.Ease;
    this.targetAttribute.Value=Quaternion.Slerp(b,e,ef(0,1,progress));
  }
}

export=RotationAnimater;