// The Gift of Response: anatomical, mechanically built cortical brain (V0.3 study).
// Upstream Anatomy turning group owns actual world-space geometry; this is not a
// 2D silhouette and there are no screen-space textures or CSS fake rotations.
// Coordinate convention: x = left/right, y = front/back, z = vertical.
export function assembleBrain(T, G, body, layer) {
  const pieces = [];
  const add = (name, at, axis, length, radius, mat="steel", ends=["dome","dome"], extras={}) => {
    T.round({
      name, group:body, layer, F:G.frameAlong(at,axis),
      s0:0,s1:length,r:radius,ends,material:mat,...extras
    });
    pieces.push(name);
  };
  const curve = (name, route, radius=.30, mat="gunmetal") => {
    if(route.length<3) throw new Error("Cortical sulcus requires >= 3 points");
    T.tube({name,group:body,layer,route,r:radius,
      material:mat,spacing:1.1,chunk:18,turn:70,caps:true});
    pieces.push(name);
  };
  // Surface of one capsule over its convex dome ends.
  function rAt(spec,y) {
    const outside=y<spec.y?spec.y-y:y>spec.y+spec.len?y-(spec.y+spec.len):0;
    return Math.sqrt(Math.max(0.1,spec.r*spec.r-outside*outside));
  }
  for(const side of [-1,1]) {
    const hand=side<0?"L":"R";
    const x=side*15.2;
    // Distinct anatomical masses, staggered in length, height and width.
    // These break the parallel-cylinder silhouette that looked like larvae.
    const lobes=[
      {id:"frontal",y:-24,len:6,z:84,r:12.7,mat:"steel"},
      {id:"parietal",y:-11,len:16,z:88.5,r:14.0,mat:"chrome"},
      {id:"occipital",y:12,len:5,z:84.6,r:11.6,mat:"steel"},
      {id:"temporal",y:-13,len:16,z:74,r:8.1,mat:"gunmetal",offset:3.2},
    ];
    for (const l of lobes) {
      add(hand+"."+l.id+".shell",[x+side*(l.offset||0),l.y,l.z],
          [0,1,0],l.len,l.r,l.mat);
    }
    // Replace raised worms and ink-like sulci with genuine shallow cortical
    // metal *plates*. Dark creases are negative space between adjacent plates.
    // Each plate has a separate 3D prism, rounded outline, real bevel and
    // material; its normal follows the capsule shell at the mounting point.
    const pattern=[
      { l:"frontal",ys:[-29.4,-20.7,-13.6],ts:[.30,.99,1.68,2.34],width:6.1,length:6.4 },
      { l:"parietal",ys:[-10.4,-1.8,7.2,14.7],ts:[.28,.96,1.65,2.33],width:6.4,length:7.8 },
      { l:"occipital",ys:[18.9,23.6],ts:[.45,1.24,2.10],width:4.8,length:4.8 },
    ];
    for(const rule of pattern){
      const l=lobes.find(k=>k.id===rule.l);
      for(let row=0;row<rule.ys.length;row++) {
        for(let col=0;col<rule.ts.length;col++) {
          // Deterministic imperfections, not a repeated tile texture.
          const jitter=(row*7+col*11+(side===1?5:0));
          const yy=rule.ys[row]+.72*Math.sin(jitter*1.31);
          const theta=rule.ts[col]+.055*Math.cos(jitter*.73);
          const rr=rAt(l,yy)+.12;
          const origin=[x+side*rr*Math.cos(theta),yy,l.z+rr*Math.sin(theta)];
          const n=[side*Math.cos(theta),0,Math.sin(theta)];
          const tangent=[Math.sin(theta),0,-side*Math.cos(theta)];
          const width=rule.width*(.91+.07*Math.sin(jitter*.92));
          const height=rule.length*(.91+.06*Math.cos(jitter*1.17));
          const poly=[
            [-width*.43,-height*.42],
            [ width*.12,-height*.50],
            [ width*.50,-height*.15],
            [ width*.43, height*.42],
            [-width*.14, height*.51],
            [-width*.52, height*.12],
          ];
          T.prism({
            name:hand+".cortical-plate."+rule.l+"."+row+"."+col,
            group:body,layer,
            F:{o:origin,a:n,u:tangent,v:[0,1,0]},
            polygon:poly,
            s0:-.15,s1:.58,round:.50,bevel:.19,
            material:(row+col)%5===0?"chrome":"steel",
            tone:"mid",crease:"faint",
          });
          pieces.push(hand+".plate."+rule.l+"."+row+"."+col);
        }
      }
    }
    // The two fissure lines are structural boundaries, not raised filaments.
    // Keep thin and dark; never distribute fluorescent wires over the cortex.
    for(let i=0;i<2;i++){
      const pts=[],l=lobes[1];
      for(let q=0;q<=10;q++){
        const t=q/10, y=-11+i*15+t*5.4;
        const theta=.08+.06*Math.sin(t*Math.PI);
        const rr=rAt(l,y)+.05;
        pts.push([x+side*rr*Math.cos(theta),y,l.z+rr*Math.sin(theta)]);
      }
      curve(hand+".sylvian-seam."+i,pts,.14,"gunmetal");
    }
    // Tiny *machined* fasteners stay on exposed lower hardware, not the gyri.
    for(let i=0;i<3;i++){
      const yy=-5+i*8;
      add(hand+".coupling.socket."+i,[x+side*14,yy,72],[0,0,1],1.0,1.1,"gold",["flat","flat"]);
    }
  }
  // Central hardware, partially visible through the longitudinal fissure.
  add("nexus.column",[0,0,48],[0,0,1],35,3.1,"gunmetal",["flat","flat"]);
  add("nexus.ring.lower",[0,0,64],[0,0,1],1.5,5.4,"gold",["flat","flat"]);
  add("nexus.ring.upper",[0,0,77],[0,0,1],1.5,5.3,"chrome",["flat","flat"]);
  add("nexus.glow-chamber",[0,0,78],[0,0,1],7,3.6,"gold",["flat","flat"]);
  // Mechanical bearing support and lower cerebellum.
  add("cerebellum.bulb",[0,15,69],[1,0,0],12,5.7,"steel");
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    add("joint."+i,[9*Math.cos(a),9*Math.sin(a),59],[0,0,1],
        3.7,.95,i%3===0?"gold":"steel",["flat","flat"]);
  }
  // 3 little visible shaft collars - precision details are justified here.
  for(let i=0;i<3;i++)add("shaft.collar."+i,[0,0,49+i*5],[0,0,1],
    1.1,6.2,i===1?"gold":"chrome",["flat","flat"]);
  return pieces;
}
