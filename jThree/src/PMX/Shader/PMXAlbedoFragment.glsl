

precision mediump float;
varying vec3 v_normal;
varying  vec2 v_uv;
varying vec4 v_pos;
uniform vec4 u_diffuse;

uniform mat4 matMVP;
uniform mat4 matMV;
uniform mat4 matV;
uniform sampler2D u_texture;
uniform sampler2D u_sphere;
varying vec2 v_spuv;
uniform int u_textureUsed;
uniform int u_sphereMode;
uniform vec4 u_addTexCoeff;
uniform vec4 u_mulTexCoeff;
uniform vec4 u_addSphereCoeff;
uniform vec4 u_mulSphereCoeff;

vec2 calcLightUV(vec4 projectionSpacePos)
{
   return (projectionSpacePos.xy/projectionSpacePos.w+vec2(1,1))/2.;
}

vec4 blendPMXTexture(sampler2D source,vec2 uv,vec4 addCoeff,vec4 mulCoeff)
{
    vec4 result=texture2D(source,uv);
    result.rgb=mix(mix(result.rgb,vec3(0,0,0),addCoeff.a),vec3(1,1,1),1.-mulCoeff.a);
    result.rgb=result.rgb*mulCoeff.rgb+addCoeff.rgb;
    return result;
}

void main(void){
  vec2 adjuv=v_uv;
  adjuv.y=1.-adjuv.y;
  gl_FragColor.rgba=u_diffuse;
    if(u_textureUsed>0) gl_FragColor.rgba*=blendPMXTexture(u_texture,adjuv,u_addTexCoeff,u_mulTexCoeff);
    if(u_sphereMode==1)
    {
      gl_FragColor.rgb*=blendPMXTexture(u_sphere,v_spuv,u_addSphereCoeff,u_mulSphereCoeff).rgb;
    }else if(u_sphereMode==2)
    {
      gl_FragColor.rgb+=blendPMXTexture(u_sphere,v_spuv,u_addSphereCoeff,u_mulSphereCoeff).rgb;
    }
}