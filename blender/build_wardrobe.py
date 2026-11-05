"""Import the authored pieces, refine materials in Blender and export one shared wardrobe."""
import os
import tempfile
from pathlib import Path

import bpy

ROOT=Path(__file__).resolve().parent.parent
source=Path(os.environ.get("TEMP") or tempfile.gettempdir())/"lulu-wardrobe-source.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.import_scene.gltf(filepath=str(source))
pieces=[o for o in bpy.context.scene.objects if o.name.startswith(("dress_","top_","bottom_","shoe_"))]
for piece in pieces:
    # Join meshes by material inside each piece. Transforms remain relative to the doll.
    materials={}
    for mesh in list(piece.children_recursive):
        if mesh.type=="MESH":
            materials.setdefault(mesh.data.materials[0],[]).append(mesh)
    for mat,objects in materials.items():
        if mat.use_nodes:
            shader=next(n for n in mat.node_tree.nodes if n.type=="BSDF_PRINCIPLED")
            shader.inputs["Roughness"].default_value=max(.37,shader.inputs["Roughness"].default_value)
            mat.diffuse_color=shader.inputs["Base Color"].default_value[:]
        if len(objects)<2:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for item in objects:
            item.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.join()
    # Remove empty decorative pivots after baking their transforms into the garment.
    for empty in reversed(list(piece.children_recursive)):
        if empty.type=="EMPTY" and not empty.children:
            bpy.data.objects.remove(empty,do_unlink=True)

def paint(name,color,roughness=.61):
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    shader=next(n for n in mat.node_tree.nodes if n.type=="BSDF_PRINCIPLED")
    def linear(c):
        c=int(c,16)/255
        return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
    rgba=tuple(linear(color[i:i+2]) for i in (0,2,4))+(1,)
    shader.inputs["Base Color"].default_value=rgba
    shader.inputs["Roughness"].default_value=roughness
    mat.diffuse_color=rgba
    return mat

cream=paint("Ivory stitching","FFECD8")
denim=paint("Denim seams","4C75AA")
lavender=paint("Lilac satin","BBA7D9")
rose=paint("Rose weave","C6749D")
gold=paint("Champagne buttons","D8A365")
blue=paint("Pocket blue","65A3D1")

def detail(parent,name,coords,r,material):
    curve=bpy.data.curves.new(name,"CURVE")
    curve.dimensions="3D"
    curve.resolution_u=8
    curve.bevel_depth,curve.bevel_resolution=r,2
    spline=curve.splines.new("BEZIER")
    spline.bezier_points.add(len(coords)-1)
    for knot,(x,z) in zip(spline.bezier_points,coords):
        depth=-.223*(max(.15,1-(x/.285)**2)**.5)-.011
        knot.co=(x,depth,z)
        knot.handle_left_type=knot.handle_right_type="AUTO"
    obj=bpy.data.objects.new(name,curve)
    bpy.context.collection.objects.link(obj)
    obj.parent=parent
    curve.materials.append(material)

def button(parent,z,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=(0,-.247,z))
    obj=bpy.context.object
    obj.name="Round button"
    obj.scale=(.017,.009,.017)
    obj.parent=parent
    obj.data.materials.append(material)

def tailor(piece):
    key=piece.name
    if key in ("top_jaqueta","top_camisa","top_camisaXadrez"):
        surface=denim if key=="top_jaqueta" else lavender if key=="top_camisa" else rose
        detail(piece,"Front placket",[(0,1.46),(0,1.64),(0,1.83),(0,1.96)],.012,surface)
        for side in (-1,1):
            detail(piece,"Folded collar",[(side*.144,1.948),(side*.109,1.865),(side*.022,1.937)],.014,surface)
            if key=="top_jaqueta":
                detail(piece,"Pocket stitching",[(side*.084,1.75),(side*.164,1.755),(side*.154,1.676),(side*.095,1.674)],.009,denim)
        for z in (1.53,1.64,1.75,1.85):
            button(piece,z,gold if key=="top_jaqueta" else cream)
        if key=="top_camisaXadrez":
            for x in (-.18,-.11,.11,.18):
                detail(piece,"Vertical plaid thread",[(x,1.47),(x,1.63),(x,1.84)],.007,cream)
            for z in (1.51,1.59,1.69,1.77,1.85):
                detail(piece,"Crosswise plaid thread",[(-.22,z),(-.11,z),(0,z),(.11,z),(.22,z)],.006,cream)
    elif key=="top_moletom":
        detail(piece,"Kangaroo pocket",[(-.155,1.55),(-.115,1.65),(0,1.64),(.115,1.65),(.155,1.55)],.016,blue)
        for side in (-1,1):
            detail(piece,"Hood drawstring",[(side*.074,1.94),(side*.065,1.82),(side*.085,1.75)],.009,cream)
    elif key=="top_colete":
        for x in (-.15,-.10,-.05,.05,.10,.15):
            detail(piece,"Knit rib",[(x,1.46),(x,1.63),(x,1.78)],.008,gold)
        detail(piece,"Ribbed V-neck",[(-.15,1.94),(0,1.76),(.15,1.94)],.014,cream)
    elif key=="top_camiseta":
        detail(piece,"Stitched heart",[(-.069,1.74),(-.069,1.79),(-.034,1.815),(0,1.78),
               (.034,1.815),(.069,1.79),(.069,1.74),(0,1.69),(-.069,1.74)],.012,cream)

for piece in pieces:
    tailor(piece)


bpy.ops.export_scene.gltf(filepath=str(ROOT/"assets"/"wardrobe.glb"),export_format="GLB", export_texcoords=False,
                         export_draco_mesh_compression_enable=True)
# Space the editable pieces in a catalog grid after exporting their doll-space poses.
for i,piece in enumerate(sorted(pieces,key=lambda o:o.name)):
    piece.location=((i%10-4.5)*1.48, (i//10)*1.68, 0)
bpy.ops.wm.save_as_mainfile(filepath=str(Path(__file__).with_name("guarda-roupa.blend")),compress=True)
