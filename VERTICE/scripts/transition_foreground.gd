extends Node2D

var area_id: int = 1
var motion_time: float = 0.0

const DARK := Color("#080d16")
const STONE := Color("#394751")
const EDGE := Color("#82969b")
const GOLD := Color("#b68b54")
const CYAN := Color("#72a9ad")

func _process(delta: float) -> void:
    motion_time += delta
    queue_redraw()

func _draw() -> void:
    var size := get_viewport_rect().size
    var c := size * 0.5
    var w := size.x
    var h := size.y

    match area_id:
        1:
            _draw_stone(c, w, h)
        2:
            _draw_gear(c, h)
        3:
            _draw_shards(c, w, h)
        4:
            _draw_twisted_metal(c, w, h)
        _:
            _draw_arch(c, h)

func _draw_stone(c: Vector2, w: float, h: float) -> void:
    var p := PackedVector2Array([
        Vector2(c.x-w, c.y-h*0.52),
        Vector2(c.x-w*0.62, c.y-h*0.66),
        Vector2(c.x-w*0.25, c.y-h*0.53),
        Vector2(c.x+w*0.08, c.y-h*0.69),
        Vector2(c.x+w*0.43, c.y-h*0.52),
        Vector2(c.x+w, c.y-h*0.61),
        Vector2(c.x+w, c.y+h*0.65),
        Vector2(c.x+w*0.55, c.y+h*0.53),
        Vector2(c.x+w*0.15, c.y+h*0.68),
        Vector2(c.x-w*0.3, c.y+h*0.51),
        Vector2(c.x-w, c.y+h*0.66)
    ])
    draw_colored_polygon(p, STONE)
    draw_polyline(p, EDGE, 3.0, true)
    draw_line(Vector2(c.x-w*0.7,c.y-h*0.3),Vector2(c.x-w*0.1,c.y+h*0.3),Color("#18232b"),5.0)
    draw_line(Vector2(c.x+w*0.2,c.y-h*0.3),Vector2(c.x+w*0.7,c.y+h*0.25),Color("#18232b"),4.0)

func _draw_gear(c: Vector2, h: float) -> void:
    var radius := h * 0.88
    var points := PackedVector2Array()
    for i in range(64):
        var angle := TAU * float(i) / 64.0
        var r := radius * (1.0 if i % 4 < 2 else 0.82)
        points.append(c + Vector2(cos(angle), sin(angle)) * r)
    draw_colored_polygon(points, Color("#303d46"))
    draw_polyline(points, EDGE, 4.0, true)
    draw_circle(c, radius*0.43, DARK)
    draw_arc(c, radius*0.43, 0.0, TAU, 64, GOLD, 5.0)
    draw_circle(c, radius*0.12, Color("#687a80"))
    for i in range(8):
        var a := TAU * float(i) / 8.0 + motion_time * 0.15
        var p1 := c + Vector2(cos(a),sin(a))*radius*0.15
        var p2 := c + Vector2(cos(a),sin(a))*radius*0.39
        draw_line(p1,p2,Color("#87999b"),7.0)

func _draw_shards(c: Vector2, w: float, h: float) -> void:
    for i in range(7):
        var x := c.x + (float(i)-3.0)*w*0.25
        var shift := sin(motion_time*1.4+float(i))*h*0.035
        var p := PackedVector2Array([
            Vector2(x-w*0.16,c.y-h*0.72+shift),
            Vector2(x+w*0.09,c.y-h*0.45+shift),
            Vector2(x+w*0.16,c.y+h*0.7+shift),
            Vector2(x-w*0.07,c.y+h*0.48+shift)
        ])
        draw_colored_polygon(p, Color("#344650"))
        draw_polyline(p, Color("#829da3"), 3.0, true)
        draw_line(p[0],p[2],Color("#18242c"),3.0)

func _draw_twisted_metal(c: Vector2, w: float, h: float) -> void:
    for i in range(5):
        var y := c.y-h*0.65+float(i)*h*0.29
        var offset := sin(motion_time*1.7+float(i))*h*0.025
        var p := PackedVector2Array([
            Vector2(c.x-w,y+offset),
            Vector2(c.x-w*0.65,y-h*0.12+offset),
            Vector2(c.x+w*0.25,y+h*0.09+offset),
            Vector2(c.x+w,y-h*0.04+offset),
            Vector2(c.x+w,y+h*0.08+offset),
            Vector2(c.x+w*0.2,y+h*0.22+offset),
            Vector2(c.x-w*0.65,y+offset),
            Vector2(c.x-w,y+h*0.12+offset)
        ])
        draw_colored_polygon(p, Color("#34434c"))
        draw_polyline(p, Color("#91a3a5"), 3.0, true)
        draw_line(Vector2(c.x-w*0.7,y),Vector2(c.x+w*0.8,y+h*0.08),Color("#19262e"),4.0)

func _draw_arch(c: Vector2, h: float) -> void:
    var outer := h*0.78
    var inner := h*0.53
    var points := PackedVector2Array()
    for i in range(33):
        var a := PI + PI*float(i)/32.0
        points.append(c + Vector2(cos(a)*outer,sin(a)*outer))
    for i in range(32,-1,-1):
        var a := PI + PI*float(i)/32.0
        points.append(c + Vector2(cos(a)*inner,sin(a)*inner))
    draw_colored_polygon(points, Color("#3c4a50"))
    draw_polyline(points, Color("#a08a68"), 4.0, true)
    draw_colored_polygon(PackedVector2Array([
        Vector2(c.x-outer,c.y),
        Vector2(c.x-inner,c.y),
        Vector2(c.x-inner,c.y+h*0.75),
        Vector2(c.x-outer,c.y+h*0.75)
    ]), Color("#303e47"))
    draw_colored_polygon(PackedVector2Array([
        Vector2(c.x+inner,c.y),
        Vector2(c.x+outer,c.y),
        Vector2(c.x+outer,c.y+h*0.75),
        Vector2(c.x+inner,c.y+h*0.75)
    ]), Color("#303e47"))
