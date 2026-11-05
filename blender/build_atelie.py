"""Build the editable Blender diorama and its web-ready glTF assets."""
import math
import random
from pathlib import Path

import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent.parent / "assets"
random.seed(24)
bpy.ops.wm.read_factory_settings(use_empty=True)

def material(name, hex_color, roughness=.45, metallic=0):
    def linear(c):
        c /= 255
        return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4
    color = [linear(int(hex_color[i:i+2], 16)) for i in (0, 2, 4)] + [1]
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic
    return mat

pink = material("Rose porcelain", "F6A5C3", .27)
rose = material("Raspberry velvet", "D66F9B")
white = material("Vanilla", "FFF1DC")
mint = material("Pistachio", "B2DDC7")
blue = material("Cloud blue", "AFDDF2")
lav = material("Lilac", "C5B3E3")
purple = material("Iris", "9B82C7")
gold = material("Champagne", "E7B273", .24, .52)
leaf = material("Sage", "77A882")
skin = material("Skin", "F7D2B0", .53)
hair = material("Hair", "5B3A24", .38)
strand = material("Hair sheen", "8B6248", .43)
iris = material("Iris color", "6B4226", .25)
dark = material("Cocoa", "33202A")
lip = material("Lips", "D98A93")
blush = material("Blush", "F3A2A7")
sclera = material("Eye white", "FFFBF5", .29)
swatches = [pink, mint, blue, lav, white]

root = None

def finish(obj, name, mat, smooth=False):
    obj.name = name
    obj.parent = root
    obj.data.materials.append(mat)
    if smooth:
        for p in obj.data.polygons:
            p.use_smooth = True
    return obj

def group(name):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.parent = root
    return obj

def ball(name, pos, scale, mat, angle=0):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, location=pos)
    obj = bpy.context.object
    obj.scale = scale
    obj.rotation_euler.y = angle
    return finish(obj, name, mat, True)

def box(name, pos, size, mat, radius=.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if radius:
        bevel = obj.modifiers.new("Rounded edges", "BEVEL")
        bevel.width, bevel.segments = radius, 3
        obj.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    return finish(obj, name, mat)

def cylinder(name, pos, radius, depth, mat, vertices=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=pos)
    obj = finish(bpy.context.object, name, mat)
    bevel = obj.modifiers.new("Rounded rim", "BEVEL")
    bevel.width, bevel.segments = min(.034, depth / 3), 3
    obj.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    return obj

def tube(name, points, radius, mat):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 8
    data.bevel_depth, data.bevel_resolution = radius, 3
    spline = data.splines.new('BEZIER')
    spline.bezier_points.add(len(points)-1)
    for knot, point in zip(spline.bezier_points, points):
        knot.co = point
        knot.handle_left_type = knot.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat)

def limb(name, a, b, width, mat):
    start, end = Vector(a), Vector(b)
    obj = ball(name, (start + end)/2, (width, width, (end-start).length/2+width*.6), mat)
    obj.rotation_euler = (end-start).to_track_quat('Z', 'Y').to_euler()
    return obj

def butterfly(name, x, y, z, size, a, b):
    for side in (-1, 1):
        ball(name, (x+side*size*.47, y, z+size*.18), (size*.54,size*.12,size*.37), a, side*.55)
        ball(name, (x+side*size*.35, y, z-size*.18), (size*.35,size*.1,size*.28), b, -side*.45)
    ball(name, (x,y-.02,z), (size*.085,size*.15,size*.37), gold)

def flower(x, y, z, size, petals):
    for i in range(6):
        t = i*math.tau/6
        ball("Petal", (x+math.cos(t)*size*.55, y-.025, z+math.sin(t)*size*.55),
             (size*.46,size*.24,size*.45), petals)
    ball("Flower center", (x,y-size*.22,z), (size*.33,size*.23,size*.33), gold)

def profile(name, x, y, rings, mat, waves=0, n=64):
    verts = []
    for radius, depth, height in rings:
        for i in range(n):
            theta = math.tau*i/n
            fold = 1+waves*math.cos(theta*18)
            verts.append((x+radius*fold*math.cos(theta), y+depth*fold*math.sin(theta), height))
    faces = [(r*n+i,r*n+(i+1)%n,(r+1)*n+(i+1)%n,(r+1)*n+i)
             for r in range(len(rings)-1) for i in range(n)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat,True)

root = group("Atelier")
box("Studio floor", (0,0,-.15),(18,18,.29),lav)
cylinder("Diorama base", (0,.1,.08),4.06,.27,white)
cylinder("Gilded edge", (0,.1,.18),4.02,.05,gold)
cylinder("Rose floor", (0,.1,.22),3.98,.09,pink)
cylinder("Lilac rug", (0,-.6,.28),1.71,.042,lav)
cylinder("Vanilla piping", (0,-.6,.30),1.65,.027,white)
cylinder("Velvet rug", (0,-.6,.32),1.60,.029,lav)
cylinder("Stage rim", (0,-.55,.37),.98,.13,gold)
cylinder("Stage top", (0,-.55,.44),.94,.09,white)
box("Back wall", (0,2.51,2.18),(7.2,.32,4.02),lav,.16)
box("Wainscot", (0,2.29,.88),(7.08,.14,1.14),purple,.055)
box("Chair rail", (0,2.18,1.46),(7.1,.19,.10),white)
box("Baseboard", (0,2.21,.38),(7.12,.21,.13),white)
arch = [(-1.08,2.15,1.46),(-1.08,2.15,2.72),(-.88,2.15,3.38),
        (-.45,2.15,3.72),(0,2.15,3.82),(.45,2.15,3.72),(.88,2.15,3.38),
        (1.08,2.15,2.72),(1.08,2.15,1.46)]
tube("Portal molding", arch, .065, white)
tube("Portal inlay", [(x, y-.065, z) for x,y,z in arch], .017, gold)
box("Window seat", (0,2.02,1.48),(2.34,.58,.12),white)

for i in range(16):
    x = -3.15 + i*.42
    z = 3.97 - .34*(1-(x/3.2)**2)
    points = [(x-.13,2.06,z),(x+.13,2.06,z),(x,2.02,z-.22)]
    mesh=bpy.data.meshes.new("Pennant")
    mesh.from_pydata(points,[],[(0,2,1)])
    obj=bpy.data.objects.new("Pennant",mesh)
    bpy.context.collection.objects.link(obj)
    finish(obj,"Pennant",swatches[i%5])
tube("Garland cord",[(x,2.06,3.97-.34*(1-(x/3.2)**2)) for x in [-3.32,-2,-1,0,1,2,3.32]],.012,gold)

for x in (-2.65,2.65):
    for z in (.62,1.16):
        box("Wall trim", (x,2.18,z),(1.48,.07,.36),lav,.035)

# The sewing desk and its small tools.
box("Sewing cabinet",(-2.35,.64,.83),(1.66,.83,.99),mint,.09)
box("Desk top",(-2.35,.64,1.38),(1.85,1.01,.16),white,.075)
for i in range(3):
    z=.56+i*.28
    box("Drawer",(-2.35,.193,z),(1.43,.12,.22),mint,.04)
    ball("Drawer pull",(-2.35,.104,z),(.075,.047,.039),gold)
box("Machine base",(-2.45,.63,1.51),(.81,.42,.14),gold,.07)
box("Machine foot",(-2.18,.66,1.73),(.24,.29,.40),pink,.085)
box("Machine arm",(-2.43,.66,1.95),(.69,.32,.23),pink,.092)
box("Machine head",(-2.73,.65,1.85),(.21,.29,.25),pink,.07)
limb("Needle",(-2.73,.55,1.58),(-2.73,.55,1.74),.013,gold)
for i, mat in enumerate([rose, blue, purple]):
    x=-1.83+i*.16
    cylinder("Spool", (x,.53,1.53),.064,.17,mat,20)
    for z in (1.455,1.61):
        cylinder("Spool cap",(x,.53,z),.078,.029,white,20)
box("Floating shelf",(-2.57,2.04,2.36),(1.24,.47,.13),white)
for i in range(5):
    box("Fabric bolt",(-3.02+i*.20,2.02,2.57),(.14,.28,.34+i%2*.09),swatches[i],.04)

# A brass garment rack with fabric samples.
for x in (1.54,3.27):
    limb("Rack upright",(x,1.03,.28),(x,1.03,2.75),.046,gold)
    ball("Finial",(x,1.03,2.78),(.081,.081,.08),gold)
    box("Rack foot",(x,1.03,.34),(.24,.72,.10),white)
limb("Rack rail",(1.51,1.03,2.68),(3.31,1.03,2.68),.037,gold)
for i, mat in enumerate((pink,lav,blue,mint)):
    x=1.82+i*.39
    tube("Hanger",[(x,1.03,2.71),(x,1.02,2.57),(x-.14,1.02,2.44),
                   (x+.14,1.02,2.44),(x,1.02,2.57)],.016,white)
    profile("Doll dress sample",x,1.03,[(.26,.102,1.70+i*.046),(.15,.078,2.10),
            (.10,.064,2.23),(.16,.070,2.44)],mat,.065,40)
    ball("Dress sash",(x,.951,2.21),(.11,.021,.038),white)

for x,y in [(-2.7,-1.28),(2.7,-1.15)]:
    profile("Fluted vase",x,y,[(.27,.27,.29),(.35,.35,.57),(.27,.27,.83),(.22,.22,.88)],mint,.07)
    cylinder("Vase lip",(x,y,.88),.23,.055,gold)
    cylinder("Vase soil",(x,y,.889),.197,.025,dark)
    for i in range(5):
        dx=(i-2)*.14
        h=1.13 + .29*random.random()
        tube("Stem",[(x,y,.87),(x+dx*.5,y,.99),(x+dx,y,h)],.017,leaf)
        ball("Leaf",(x+dx*.77,y-.035,1.01),(.1,.037,.039),leaf,(-1)**i*.42)
        flower(x+dx,y,h,.105,swatches[(i + (1 if x > 0 else 0)) % len(swatches)])

for i in range(10):
    x=-3.24 + (i%3)*.21 + random.uniform(-.13,.13)
    z=2.83+(i//3)*.31+random.uniform(-.1,.09)
    y=1.68+random.uniform(-.17,.17)
    s=random.uniform(.17,.29)
    ball("Party balloon",(x,y,z),(s,s*.87,s*1.15),swatches[i%5])
    tube("Balloon ribbon",[(x,y,z-s),(x+.06,y,z-s-.18),(-2.97,1.66,2.43)],.007,gold)
for x,y,z,size in [(-1.42,1.6,3.13,.21),(1.46,1.62,3.24,.24),(2.86,1.81,3.53,.17),
                   (-2.22,-.7,1.8,.14),(1.76,-.33,1.72,.16)]:
    butterfly("Butterfly ornament",x,y,z,size,pink,blue)

root = None
root = group("Lulu")
ball("Head",(0,0,2.56),(.48,.374,.50),skin)
ball("Torso",(0,.02,1.64),(.28,.19,.39),skin)
ball("Neck",(0,.015,2.05),(.126,.125,.21),skin)
for side in (-1,1):
    x=side*.14
    ball("Ear",(side*.454,-.016,2.51),(.085,.069,.112),skin)
    ball("Inner ear",(side*.482,-.069,2.51),(.032,.025,.056),blush)
    limb("Leg",(x,0,1.38),(x*1.26,-.01,.34),.101,skin)
    ball("Foot",(x*1.26,-.071,.27),(.11,.164,.092),skin)
    limb("Upper arm",(side*.244,.006,1.91),(side*.404,-.008,1.65),.087,skin)
    limb("Forearm",(side*.40,-.008,1.66),(side*.515,-.065,1.46),.069,skin)
    ball("Hand",(side*.542,-.076,1.42),(.076,.061,.092),skin,side*.4)
    ball("Thumb",(side*.49,-.114,1.45),(.033,.033,.047),skin,side*-.4)
    ball("Eye outline",(side*.165,-.340,2.59),(.118,.062,.093),dark,side*.12)
    ball("Eye white",(side*.165,-.365,2.583),(.107,.048,.075),sclera,side*.12)
    ball("Iris",(side*.155,-.408,2.583),(.056,.023,.065),iris)
    ball("Pupil",(side*.154,-.428,2.586),(.032,.012,.043),dark)
    ball("Catchlight",(side*.155-.014,-.438,2.609),(.017,.008,.018),sclera)
    ball("Catchlight",(side*.155+.016,-.436,2.571),(.008,.006,.009),sclera)
    ball("Rosy cheek",(side*.282,-.303,2.458),(.071,.023,.039),blush,side*-.22)
    tube("Brow",[(side*.088,-.348,2.733),(side*.16,-.35,2.754),(side*.242,-.314,2.728)],.014,hair)
ball("Nose",(0,-.379,2.485),(.056,.046,.043),skin)
tube("Smile",[(-.093,-.349,2.39),(0,-.37,2.357),(.093,-.349,2.39)],.021,lip)
tube("Smile inset",[(-.065,-.365,2.388),(0,-.391,2.369),(.065,-.365,2.388)],.011,dark)
tube("Smile glint",[(-.041,-.382,2.383),(0,-.398,2.377),(.041,-.382,2.383)],.006,sclera)

avatar = root
root = group("HairCap")
ball("Crown",(0,.051,2.807),(.498,.372,.308),hair)
for side in (-1,1):
    for i in range(6):
        x=.12+i*.039
        tube("Swept fringe",[(.045,-.156,3.055),(side*x,-.307,2.982),
             (side*(x+.127),-.322,2.821),(side*(x+.181),-.215,2.69)],
             .047-i*.0025,hair if i%3 else strand)
root = avatar
root = group("HairLong")
ball("Back volume",(0,.16,2.31),(.471,.279,.69),hair)
for side in (-1,1):
    for i in range(6):
        x=.388+i*.021
        y=.051-i*.035
        tube("Long wave",[(side*(x-.026),y,2.76),(side*(x+.028),y-.027,2.54),
             (side*(x-.015),y-.018,2.28),(side*(x+.045),y-.032,2.06),
             (side*(x+.02),y-.075,1.81+i*.026)],.056-i*.003,hair if i%3 else strand)

root = avatar
preview = group("Butterfly dress - Blender preview")
root = preview
profile("Pleated butterfly skirt",0,0,[(.68,.435,.46),(.66,.423,.58),(.52,.36,1.05),
        (.32,.216,1.50),(.265,.216,1.64)],pink,.074)
profile("Gathered bodice",0,0,[(.273,.217,1.42),(.28,.225,1.57),(.306,.218,1.77),
        (.266,.178,1.90),(.235,.139,1.91)],pink,.025)
for side in (-1,1):
    tube("Shoulder ribbon",[(side*.165,-.173,1.83),(side*.205,-.076,2.022),
         (side*.211,.06,2.02),(side*.165,.17,1.83)],.033,white)
    ball("Sandal sole",(side*.177,-.09,.212),(.121,.182,.052),white)
    tube("Sandal strap",[(side*.177-.1,-.156,.25),(side*.177,-.151,.345),
         (side*.177+.1,-.156,.25)],.025,gold)
butterfly("Sash bow",0,-.246,1.64,.115,white,blue)
for row in range(4):
    height=.59+row*.237
    spread=.655-row*.096
    for i in range(9):
        a=-1.25+i*.3125+row*.047
        butterfly("Butterfly applique",spread*math.sin(a),-(spread*.66+.044)*math.cos(a),
                  height,.045+(i%3)*.007,white,blue)

root = None
scene = bpy.context.scene
scene.world = bpy.data.worlds.new("Lilac dusk")
scene.world.use_nodes = True
scene.world.node_tree.nodes.get("Background").inputs[0].default_value=(.48,.38,.58,1)
scene.world.node_tree.nodes.get("Background").inputs[1].default_value=.38

def aim(obj, point):
    obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()

for name, pos, power, size, color in [
    ("Softbox",(-3,-4,7),1050,5,(1,.80,.72)),
    ("Fill",(4,-2,4),600,4,(.73,.85,1)),
    ("Rim",(0,3,6),900,3,(1,.76,.89)),
]:
    lamp=bpy.data.lights.new(name,'AREA')
    lamp.energy, lamp.size, lamp.color=power,size,color
    obj=bpy.data.objects.new(name,lamp)
    scene.collection.objects.link(obj)
    obj.location=pos
    aim(obj,(0,0,1.65))

camera=bpy.data.cameras.new("Studio camera")
camera.type='ORTHO'
camera.ortho_scale=9
obj=bpy.data.objects.new("Studio camera",camera)
scene.collection.objects.link(obj)
obj.location=(3,-12,6.6)
aim(obj,(0,0,1.9))
scene.camera=obj
avatar.location=(0,-.55,.25)
scene.render.resolution_x=1280
scene.render.resolution_y=940
scene.render.resolution_percentage=100

bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(Path(__file__).with_name("atelie.blend")))
for name, selection in [("atelie", bpy.data.objects["Atelier"]),("lulu-3d",avatar)]:
    bpy.ops.object.select_all(action='DESELECT')
    for item in [selection,*selection.children_recursive]:
        if item != preview and item not in preview.children_recursive:
            item.select_set(True)
    if selection == avatar:
        avatar.location=(0,0,0)
    bpy.ops.export_scene.gltf(filepath=str(OUT/f"{name}.glb"), export_format="GLB",
                             use_selection=True, export_apply=True)
