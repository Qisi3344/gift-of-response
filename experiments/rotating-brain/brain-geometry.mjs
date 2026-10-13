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
    // Sulci are *dark recessed seam lines*, not raised chrome caterpillars.
    // Irregularly spaced and interrupted; 2-3 per lobe rather than a grid.
    // Each polyline is sampled on the lobe's actual 3D surface.
    const plan=[
      ["frontal",[-31.0,-22.6,-13.5]],
      ["parietal",[-9.0,-0.8,8.2]],
      ["occipital",[14.9,23.4]],
    ];
    for(const [name,rows] of plan){
      const l=lobes.find(k=>k.id===name);
      for(let row=0;row<rows.length;row++){
        const yc=rows[row], segments=row%2===0?2:1;
        for(let seg=0;seg<segments;seg++){
          const n=15;
          const a0=(seg===0?.19:1.53)+.10*((row+seg)%2);
          const a1=(seg===0?1.74:2.81)-.09*row;
          const pts=[];
          for(let q=0;q<=n;q++){
            const t=q/n;
            const a=a0+(a1-a0)*t;
            const wav=2.2*Math.sin((t*1.45+row*.34+seg*.37)*Math.PI) +
              .7*Math.sin(t*3.3*Math.PI+row*1.5);
            const y=yc+wav;
            const rr=rAt(l,y)+.18;
            pts.push([x+side*rr*Math.cos(a),y,l.z+rr*Math.sin(a)]);
          }
          curve(hand+".sulcus."+name+"."+row+"."+seg,pts,.26+(row===1?.06:0));
        }
      }
    }
    // The lateral fissure is an interrupted, purposeful dark separation
    // above the temporal shell. Not a copper zipper laid across the brain.
    for(let strip=0;strip<2;strip++){
      const pts=[];
      for(let q=0;q<=11;q++){
        const t=q/11, y=-16+(strip*13)+t*9.5;
        const l=lobes[1], rr=rAt(l,y)+.08;
        const a=.12+.065*Math.sin(t*Math.PI);
        pts.push([x+side*rr*Math.cos(a),y,l.z+rr*Math.sin(a)]);
      }
      curve(hand+".lateral-fissure."+strip,pts,.33,"gunmetal");
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
