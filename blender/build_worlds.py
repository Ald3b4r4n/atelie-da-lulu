"""Model each destination as an editable Blender scene and export its web GLB."""
import math
import random
from pathlib import Path

import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent.parent / "assets" / "worlds"
OUT.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0

def paint(hex_color):
    name="#" + hex_color
    existing=bpy.data.materials.get(name)
    if existing:
        return existing
    def linear(value):
        s=int(value,16)/255
        return s/12.92 if s <= .04045 else ((s+.055)/1.055)**2.4
    color=tuple(linear(hex_color[i:i+2]) for i in (0,2,4))+(1,)
    mat=bpy.data.materials.new(name)
    mat.diffuse_color=color
    mat.use_nodes=True
    shader=next(n for n in mat.node_tree.nodes if n.type=="BSDF_PRINCIPLED")
    shader.inputs["Base Color"].default_value=color
    shader.inputs["Roughness"].default_value=.52
    return mat

def part(name,color,smooth=False):
    obj=bpy.context.object
    obj.name=name
    obj.parent=root
    obj.data.materials.append(paint(color))
    if smooth:
        for face in obj.data.polygons:
            face.use_smooth=True
    return obj

def ball(name,x,y,z,scale,color):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=(x,y,z))
    obj=part(name,color,True)
    obj.scale=scale
    return obj

def block(name,x,y,z,size,color,bevel=.07):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    obj=part(name,color)
    obj.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=obj.modifiers.new("Soft edges","BEVEL")
        mod.width,mod.segments=bevel,3
        obj.modifiers.new("Weighted normals","WEIGHTED_NORMAL")
    return obj

def column(name,x,y,z,r,d,color,top=None,n=32):
    bpy.ops.mesh.primitive_cone_add(vertices=n,radius1=r,radius2=r if top is None else top,
                                   depth=d,location=(x,y,z))
    return part(name,color)

def line(name,points,r,color):
    curve=bpy.data.curves.new(name,"CURVE")
    curve.dimensions="3D"
    curve.resolution_u=8
    curve.bevel_depth,curve.bevel_resolution=r,3
    spline=curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points)-1)
    for knot,co in zip(spline.bezier_points,points):
        knot.co=co
        knot.handle_left_type=knot.handle_right_type="AUTO"
    obj=bpy.data.objects.new(name,curve)
    bpy.context.collection.objects.link(obj)
    obj.parent=root
    obj.data.materials.append(paint(color))
    return obj

def arch(name,x,y,z,r,thickness,color):
    points=[(x+r*math.cos(a*math.pi/16),y,z+r*math.sin(a*math.pi/16)) for a in range(17)]
    return line(name,points,thickness,color)

def cloud(x,y,z,s,color="FFF7FF"):
    for dx,dy,dz,r in [(-.43,0,0,.44),(-.10,.05,.16,.56),(.34,0,.08,.47),(.61,0,-.03,.28)]:
        ball("Puffy cloud",x+dx*s,y+dy*s,z+dz*s,(r*s,.31*s,r*.62*s),color)

def hill(x,y,z,s,color):
    ball("Rolling terrain",x,y,z,(s,s*.47,s*.53),color)

def tree(x,y,s,color="7FB48C",pine=False,base=.23):
    column("Tree trunk",x,y,base+s*.44,.11*s,.88*s,"AA795E",.075*s,12)
    if pine:
        for i in range(3):
            column("Pine crown",x,y,base+s*(.64+i*.39),s*(.49-i*.11),s*.73,color,0,10)
    else:
        for dx,dz,r in [(-.24,.94,.43),(.21,1.04,.42),(0,1.28,.49)]:
            ball("Leafy canopy",x+dx*s,y,base+dz*s,(r*s,.34*s,r*s),color)

def bloom(x,y,z,s,color):
    line("Flower stem",[(x,y,.22),(x-.03,y,z*.68),(x,y,z)],.019,"77A988")
    for i in range(6):
        t=i*math.tau/6
        ball("Petal",x+math.cos(t)*s*.52,y,z+math.sin(t)*s*.52,(s*.42,s*.17,s*.42),color)
    ball("Pollen",x,y-.04,z,(s*.32,s*.18,s*.32),"F8CA71")

def flowers(color_a,color_b):
    for i in range(14):
        side=(-1)**i
        bloom(side*(1.23+rng.random()*2.1),-.90+rng.random()*2.2,.40+rng.random()*.49,
              .095+rng.random()*.06,color_a if i%3 else color_b)

def fence(x,y,length,color="FFF2DC"):
    for i in range(7):
        xx=x-length/2+i*length/6
        block("Fence post",xx,y,.59,(.11,.16,.72),color)
        column("Fence cap",xx,y,.98,.102,.13,color,0,4).rotation_euler.z=math.pi/4
    for z in (.45,.71):
        block("Fence rail",x,y,z,(length,.10,.085),color)

def building(name,x,y,w,h,d,color,roof):
    block(name,x,y,.23+h/2,(w,d,h),color,.1)
    top=column("Gabled roof",x,y,.23+h+w*.26,w*.78,w*.55,roof,0,4)
    top.rotation_euler.z=math.pi/4
    block("Front door",x,y-d/2-.024,.23+h*.29,(w*.30,.11,h*.56),"F3D5B4",.085)
    for side in (-1,1):
        block("Window frame",x+side*w*.30,y-d/2-.021,.23+h*.68,(w*.20,.11,h*.24),"FFF0D8")
        block("Window pane",x+side*w*.30,y-d/2-.085,.23+h*.68,(w*.143,.025,h*.17),"B1D9EE",.028)

def star(name,x,y,z,size,color):
    verts=[(0,0,0)]
    for i in range(10):
        a=math.pi/2+i*math.pi/5
        r=size*(1 if i%2==0 else .46)
        verts.append((r*math.cos(a),0,r*math.sin(a)))
    faces=[(0,i+1,(i+1)%10+1) for i in range(10)]
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    obj.parent=root
    obj.location=(x,y,z)
    mesh.materials.append(paint(color))
    mod=obj.modifiers.new("Cookie thickness","SOLIDIFY")
    mod.thickness=size*.24
    return obj

def water(y,z,color):
    block("Water",0,y,z,(12,4,.09),color,.04)
    for i in range(9):
        x=rng.uniform(-5,5)
        yy=y+rng.uniform(-1.55,1.55)
        line("Ripple",[(x-.27,yy,z+.047),(x,yy-.05,z+.047),(x+.25,yy,z+.047)],.013,"DBF8F9")

def parasol(x,y,s,color):
    column("Parasol pole",x,y,.23+s*.66,.035*s,1.3*s,"C28D64")
    column("Parasol canopy",x,y,.23+s*1.35,.64*s,.30*s,color,.075*s,12)
    for i in range(12):
        a=i*math.tau/12
        line("Canopy stitching",[(x,y,.23+s*1.51),(x+.37*s*math.cos(a),y+.37*s*math.sin(a),.23+s*1.42),
             (x+.63*s*math.cos(a),y+.63*s*math.sin(a),.23+s*1.20)],.012*s,"FFF3E0")

def candy(x,y,z,s,color):
    line("Candy stick",[(x,y,.23),(x,y,z)],.045,"FFF1E3")
    ball("Candy disk",x,y,z,(s,.11,s),color)
    points=[]
    for i in range(22):
        a=i*.45
        r=s*.075*i/2
        points.append((x+r*math.cos(a),y-.10*math.sqrt(max(.08,1-(r/s)**2)),z+r*math.sin(a)))
    line("Icing swirl",points,.017,"FFF4E8")

def scenery(key):
    if key=="praia":
        water(2.75,.247,"74CFDE")
        for x,y,s in [(-2.4,.63,1.24),(2.53,1.02,.91)]:
            parasol(x,y,s,"F6A0BC" if x<0 else "F9CA80")
            block("Beach towel",x,y-.36,.273,(.79,.74,.035),"AEDDF4")
        for x,y in [(-1.47,-.09),(1.51,-.28),(2.5,-.8)]:
            ball("Shell",x,y,.32,(.17,.12,.074),"FFBBA7")
        cloud(-1.31,3.2,3.51,1.35)
        cloud(2.61,3.4,3.16,1.10)
    elif key=="jardim":
        for x,y,s,col in [(-2.7,1.15,1.65,"9DD1A3"),(2.54,1.30,1.77,"91C6AD"),(.88,3.25,1.8,"B9DDA7")]:
            tree(x,y,s,col)
        for i,c in enumerate(["F1A0BD","F7C989","F3DD9F","A3D6B9","A9D1EA"]):
            arch("Flower garden arbor",0,2.31,1.68,1.05+i*.073,.034,c)
        for x in (-1.33,1.33):
            column("Arbor upright",x,2.31,1,.047,1.51,"E5AF7E")
        flowers("F3A2BB","F7DA90")
    elif key=="festa":
        for side in (-1,1):
            for i in range(11):
                x=side*(1.54+rng.random()*1.68)
                y=.8+rng.random()*.7
                z=1.56+rng.random()*2.2
                r=.18+rng.random()*.16
                ball("Party balloon",x,y,z,(r,r*.87,r*1.17),["F6A0BE","B8DDF4","BAA6E1","B5DEC3"][i%4])
                line("Ribbon",[(x,y,z-r),(x+.07,y,z-r-.20),(side*2.30,1.22,1.17)],.008,"E4AF76")
        for i in range(3):
            column("Birthday cake tier",0,2.43,.48+i*.32,.62-i*.14,.32,["E7A8CA","F8D5E7","C0B5E8"][i])
        star("Cake topper",0,2.43,1.66,.19,"F7D28D")
    elif key in ("ceu","espaco"):
        if key=="espaco":
            ball("Ringed planet",-2.34,2.29,2.66,(.72,.67,.72),"EAA6C8")
            ring=column("Saturn ring",-2.34,2.29,2.64,1.09,.052,"F0D192")
            ring.rotation_euler.y=.31
            ball("Blue planet",2.7,3.1,3.2,(.60,.62,.60),"A3C8F3")
            column("Rocket body",2.17,.75,1.09,.27,1.26,"FFF2D9")
            column("Rocket nose",2.17,.75,1.92,.27,.42,"EAA0BB",0)
            ball("Rocket window",2.17,.48,1.26,(.12,.047,.12),"8EC5E7")
            for dx in (-.27,.27):
                column("Rocket fin",2.17+dx,.75,.56,.15,.63,"CC9CDF",.025,4)
        else:
            ball("Honey moon",-2.24,3.0,2.78,(.57,.21,.57),"FFE4A6")
            cloud(-1.53,2.26,1.01,1.7,"CCB9EB")
            cloud(2.46,1.18,1.37,1.4,"BAC7F0")
        for i in range(25):
            x=rng.uniform(-4.8,4.8)
            z=rng.uniform(1.43,4.35)
            star("Constellation",x,3.6,z,rng.uniform(.04,.14),"FBE4AC")
    elif key in ("floresta","neve","cabana"):
        snowy=key=="neve"
        for i in range(9):
            x=(i-4)*.91
            y=2.22+abs(x)*-.19+rng.random()*.68
            tree(x,y,1.12+rng.random()*.88,"D3ECF7" if snowy else ["689A91","8FBA91","739C9B"][i%3],True)
        if key=="cabana":
            building("Forest cabin",-2.14,1.12,1.66,1.32,1.20,"C58968","885E65")
            column("Campfire bowl",2.14,.48,.34,.33,.15,"BA8276")
            for i in range(4):
                column("Campfire flame",2.14+.08*math.sin(i),.48+.08*math.cos(i),.60,.11,.43,"FFC276" if i%2 else "F5A187",0)
        elif snowy:
            hill(-2.78,2.6,.38,1.9,"E8F4FA")
            for z,r in [(.47,.30),(.84,.23),(1.14,.165)]:
                ball("Snow friend",-2.07,.70,z,(r,r,r),"F9FCFF")
            ball("Carrot nose",-2.07,.52,1.13,(.044,.12,.046),"F9AD78")
            for i in range(23):
                ball("Snowflake",rng.uniform(-4.2,4.2),2+rng.random(),1+rng.random()*3,(.026,)*3,"FFF9FC")
        else:
            for i in range(12):
                x=(-1)**i*rng.uniform(1.2,3.3)
                y=rng.uniform(-.83,1.8)
                column("Mushroom stem",x,y,.40,.065,.34,"FBE8CF",.044)
                ball("Mushroom cap",x,y,.58,(.18,.18,.12),"EA9DB7" if i%2 else "B9A4DB")
                for dx,dy in [(-.085,-.04),(.06,-.081),(.016,.07)]:
                    ball("Cap speckle",x+dx,y+dy,.676,(.025,.025,.011),"FFF4E6")
    elif key=="castelo":
        block("Castle facade",0,2.84,1.12,(4.39,.56,1.82),"E5C6EF",.12)
        for x in (-2.05,2.05):
            column("Tower",x,2.15,1.24,.49,2.11,"F1C6DE")
            column("Spire",x,2.15,2.66,.61,.91,"A898DD",0,16)
            column("Flag staff",x,2.15,3.23,.021,.54,"E7BA7F")
            block("Flag",x+.18,2.15,3.36,(.37,.04,.18),"F3A8CA",.018)
            block("Tower window",x,1.69,1.72,(.21,.08,.38),"9AB7DB")
        for i in range(9):
            block("Battlement",-1.72+i*.43,2.52,2.12,(.25,.27,.33),"F4D3E9")
        block("Castle door",0,2.51,.76,(.91,.14,1.04),"BA8FB5",.17)
        flowers("E7A1CD","CFB2E9")
    elif key in ("nuvens","arcoIris"):
        for i in range(7):
            cloud(-3.1+i*1.1,2.4+math.sin(i)*.49,.51+(i%3)*.26,1.14,
                  ["FFF3FA","E9D6F4","DFEDFB"][i%3])
        if key=="arcoIris":
            for i,color in enumerate(["EA94BA","F1B384","F6D88F","A9D9B1","A2CFE8","BCA9E2"]):
                arch("Rainbow",0,3.0,1.14,1.40+i*.19,.106,color)
        else:
            for x,y,z,s,color in [(-2.1,1.72,2.89,1.03,"EEA1C1"),(2.16,1.64,2.73,.88,"B8ACE9"),
                                  (.58,3.42,3.41,.70,"A4CFDB")]:
                ball("Hot air balloon",x,y,z,(.51*s,.44*s,.62*s),color)
                for side in (-1,1):
                    line("Basket rope",[(x+side*.21*s,y,z-.40*s),(x+side*.13*s,y,z-.83*s)],
                         .015,"DBAF87")
                block("Woven basket",x,y,z-.91*s,(.33*s,.29*s,.20*s),"D4A47D",.06)
        for side in (-1,1):
            cloud(side*2.33,.59,.72,1.11,"FFF2FA")
            star("Cloud star",side*1.89,1.41,2.6,.22,"F8D18B")
    elif key=="circo":
        column("Circus tent",0,2.6,1.06,1.80,1.68,"F0ADC5",1.80,32)
        column("Circus roof",0,2.6,2.58,1.97,1.40,"F3B7CE",0,24)
        for i in range(12):
            a=i*math.tau/12
            line("Tent piping",[(0,2.6,3.31),(.98*math.cos(a),2.6+.98*math.sin(a),2.62),
                 (1.95*math.cos(a),2.6+1.95*math.sin(a),1.89)],.031,"FFF2DA")
        column("Tent finial",0,2.6,3.44,.083,.21,"F3C581")
        star("Marquee",-2.53,1.0,1.66,.40,"F8CF88")
        for i in range(5):
            column("Circus pedestal",2.24+i*.24,.52+i*.16,.32,.21,.20+i*.025,["BCA6E6","95CFE3","EEA1C2"][i%3])
    elif key in ("fazenda","escola","estacao"):
        if key=="fazenda":
            building("Barn",-2.05,1.57,2.23,1.45,1.31,"DD8A85","AF6975")
            fence(1.98,1.28,2.36)
            for i in range(4):
                ball("Hay bale",1.33+i*.39,1.77,.40,(.26,.24,.21),"E3B875")
            tree(2.84,2.25,1.70,"8DBB95")
        elif key=="escola":
            building("School",-.98,2.42,3.28,1.63,1.34,"EBA7B7","A997D5")
            ball("School clock",-.98,1.67,1.78,(.22,.059,.22),"FFF4D8")
            line("Clock hands",[(-.98,1.605,1.89),(-.98,1.60,1.78),(-.89,1.605,1.75)],.014,"805D7D")
            for i in range(3):
                block("Play blocks",2.0+i*.45,.74,.46,(.43,.45,.47),["B9A6E0","F0ADBE","A7D8CA"][i])
            tree(3.25,2.03,1.42)
        else:
            building("Train station",-.68,2.76,3.10,1.48,1.06,"D8A6AB","947EA2")
            for y in (.95,1.65):
                block("Rail",0,y,.27,(8,.07,.05),"AA8897",.02)
            for i in range(13):
                block("Rail tie",-3.8+i*.62,1.30,.259,(.15,.85,.036),"D2AC94",.02)
            block("Toy locomotive",2.22,1.30,.61,(1.31,.70,.48),"9ACEC5")
            block("Engine cab",2.58,1.30,1.02,(.61,.67,.57),"C4ACE6")
            column("Chimney",1.93,1.30,.98,.12,.42,"E4A8BF")
            for x in (1.79,2.25,2.69):
                column("Rail wheel",x,.93,.43,.17,.09,"926B91").rotation_euler.x=math.pi/2
    elif key=="piscina":
        water(2.03,.257,"83D5E8")
        for x,y in [(-2.64,1.57),(2.22,1.56)]:
            for dx in (-.13,.13):
                line("Pool rail",[(x+dx,y-.49,.32),(x+dx,y-.49,.72),(x+dx,y,.84),
                      (x+dx,y+.18,.33)],.027,"C4CCEA")
        for x,y,col in [(-1.68,1.95,"EF9FC5"),(1.73,2.55,"F2CD81"),(3.03,2.15,"B9A7E7")]:
            bpy.ops.mesh.primitive_torus_add(major_segments=24,minor_segments=10,location=(x,y,.35),
                                            major_radius=.32,minor_radius=.091)
            part("Swim ring",col,True)
        parasol(-2.42,-.01,.94,"B4A6E5")
        parasol(2.54,.04,.90,"EAA2BD")
    elif key=="deserto":
        for x,y,s in [(-3.4,2.76,2.66),(2.8,2.82,2.80),(0,3.1,2.0)]:
            hill(x,y,.39,s,"EFC086" if x<0 else "F5CE97")
        ball("Sun",1.62,3.76,3.56,(.42,.14,.42),"FFE3A8")
        for x,y,s in [(-2.39,1.04,1.12),(2.64,.62,.91),(1.59,1.61,.66)]:
            ball("Cactus",x,y,.23+s*.65,(.16*s,.13*s,.68*s),"82B593")
            for side in (-1,1):
                line("Cactus branch",[(x,y,.23+s*.60),(x+side*.23*s,y,.23+s*.67),
                     (x+side*.28*s,y,.23+s*.99)],.075*s,"91C5A2")
            ball("Cactus bloom",x,y,.23+s*1.31,(.11,.08,.084),"EF9DB8")
    elif key=="mar":
        for x,y,s in [(-2.55,.75,1.04),(2.45,.95,1.19),(-1.33,2.03,.68),(1.61,2.18,.72)]:
            for i in range(5):
                dx=(i-2)*.16*s
                line("Coral",[(x,y,.23),(x+dx*.6,y,.53*s),(x+dx,y,(.87+i%3*.15)*s)],
                     .051*s,"EA9ABF" if x<0 else "AE9EDC")
        for i in range(12):
            x=rng.uniform(-3.8,3.8)
            y=rng.uniform(1.2,3.4)
            z=rng.uniform(1.35,3.38)
            col=["F3C994","A9DAEE","ECA6CF"][i%3]
            ball("Fish body",x,y,z,(.18,.072,.10),col)
            ball("Fish tail",x-.17,y,z,(.079,.039,.085),col)
            ball("Fish eye",x+.075,y-.061,z+.018,(.017,.012,.017),"694C75")
        star("Sea star",1.8,-.19,.35,.21,"EFA2B2").rotation_euler.x=-.73
    elif key=="doceria":
        for x,y,z,s,color in [(-2.62,.56,1.69,.33,"E99DC0"),(-1.76,1.42,2.32,.38,"A99DDF"),
                                (2.27,.69,1.92,.41,"9AD0CF"),(2.93,1.34,2.58,.33,"EEB18D")]:
            candy(x,y,z,s,color)
        for x,y in [(-1.66,.29),(2.55,-.23),(1.40,1.39)]:
            column("Cupcake liner",x,y,.40,.19,.35,"BCA0DB",.27,20)
            ball("Frosting",x,y,.64,(.29,.29,.17),"F4AECD")
            ball("Cherry",x,y,.82,(.074,.074,.074),"DB7194")
        for i in range(5):
            cloud(-2.62+i*1.26,3.2,3.18+math.sin(i)*.21,.72,"FFDEED")

THEMES={
 "praia":("A9DFF0","F3D8AC","F4D2A2"), "jardim":("C5E3DA","A7CFA7","CADDA9"),
 "festa":("DDC5F0","E8BBD7","F1C5DF"), "ceu":("6C71B0","A69ACD","C2AADC"),
 "floresta":("B0CFC3","93B6A0","9AC09C"), "castelo":("D7CAEE","DCC3E5","F0D5E8"),
 "nuvens":("B5D7F2","D4D7F5","E2D9F3"), "circo":("F4D0DD","E9B9D0","F1C4C9"),
 "fazenda":("C6E3ED","B2CBA2","BDCF9D"), "escola":("D6DAF0","D8C5DD","E8D2E6"),
 "piscina":("A9D9EC","C7DBE9","D4E9EF"), "neve":("CADDF0","DAE9F5","E7F1FA"),
 "deserto":("F5D5B8","E9C198","F2CDA0"), "mar":("84C5DA","9FCED9","B3DEDD"),
 "arcoIris":("C4C9EF","D7C3EA","EDD4EB"), "doceria":("F2CFE2","EBC0D6","F4CCDE"),
 "estacao":("D9CFDF","DBC9D9","E3CEDB"), "cabana":("C4B4C4","B7AAAB","C9B3A9"),
 "espaco":("575583","9392C3","B8A8D7"),
}
for i,(key,(sky,ground,base)) in enumerate(THEMES.items()):
    rng=random.Random(204+i)
    scene=bpy.context.scene if i==0 else bpy.data.scenes.new(key)
    scene.name=key
    bpy.context.window.scene=scene
    root=bpy.data.objects.new("World_"+key,None)
    scene.collection.objects.link(root)
    root["sky"]="#"+sky
    block("Horizon floor",0,0,-.15,(24,24,.29),ground,0)
    column("Diorama base",0,.1,.115,4.32,.25,base,n=80)
    column("Diorama piping",0,.1,.225,4.31,.055,base,n=80)
    column("Look pedestal trim",0,-.55,.372,.98,.14,"E7B87E")
    column("Look pedestal",0,-.55,.447,.94,.078,"FFF0DD")
    scenery(key)
    bpy.ops.object.select_all(action="DESELECT")
    for item in [root,*root.children_recursive]:
        item.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(OUT/(key+".glb")),export_format="GLB",use_selection=True,
                             use_active_scene=True,export_apply=True,export_extras=True)
    camera=bpy.data.cameras.new("Diorama camera")
    camera.type="ORTHO"
    camera.ortho_scale=7.7
    view=bpy.data.objects.new("Diorama camera",camera)
    scene.collection.objects.link(view)
    view.location=(.7,-10.8,4.65)
    view.rotation_euler=(Vector((0,0,1.91))-view.location).to_track_quat("-Z","Y").to_euler()
    scene.camera=view
    world=bpy.data.worlds.new("Theme sky")
    world.color=paint(sky).diffuse_color[:3]
    scene.world=world
    scene.render.engine="BLENDER_WORKBENCH"
    scene.display.shading.color_type="MATERIAL"
    scene.display.shading.light="STUDIO"
    scene.display.shading.show_cavity=True
    scene.display.shading.background_type="WORLD"
    scene.render.resolution_x,scene.render.resolution_y=1400,1100

bpy.context.window.scene=bpy.data.scenes["praia"]
bpy.ops.wm.save_as_mainfile(filepath=str(Path(__file__).with_name("mundos.blend")),compress=True)
