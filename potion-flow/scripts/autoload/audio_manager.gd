extends Node
## Sound effects, ambient music and haptics (autoload "AudioManager").
##
## Sounds load from res://assets/audio/sfx/<id>.ogg and the music from
## res://assets/audio/music/ambient.ogg (rendered by tools/make_audio.py).
## To swap a sound, replace its file (ogg, wav or mp3). If a file is missing,
## a simple synthesised fallback is generated so the game is never silent.

const SFX_DIR := "res://assets/audio/sfx/"
const MUSIC_PATH := "res://assets/audio/music/ambient"
const MIX_RATE := 22050
const POOL_SIZE := 8

var _sfx: Dictionary = {}
var _pool: Array[AudioStreamPlayer] = []
var _music: AudioStreamPlayer
var _sfx_bus := 0
var _music_bus := 0
var _music_task := -1


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_sfx_bus = _ensure_bus("SFX")
	_music_bus = _ensure_bus("Music")
	for _k in range(POOL_SIZE):
		var p := AudioStreamPlayer.new()
		p.bus = "SFX"
		add_child(p)
		_pool.append(p)
	_music = AudioStreamPlayer.new()
	_music.bus = "Music"
	add_child(_music)
	_build_sfx()
	apply_settings()
	SaveManager.changed.connect(func(s: String) -> void:
		if s == "settings":
			apply_settings()
	)
	# Music synthesis takes a moment, so do it off the main thread.
	_music_task = WorkerThreadPool.add_task(_build_music_threaded)


func _ensure_bus(bus_name: String) -> int:
	var idx := AudioServer.get_bus_index(bus_name)
	if idx >= 0:
		return idx
	AudioServer.add_bus()
	idx = AudioServer.bus_count - 1
	AudioServer.set_bus_name(idx, bus_name)
	AudioServer.set_bus_send(idx, "Master")
	return idx


func apply_settings() -> void:
	var mv := float(SaveManager.get_value("settings", "music_volume", 0.6))
	var sv := float(SaveManager.get_value("settings", "sfx_volume", 0.8))
	AudioServer.set_bus_volume_db(_music_bus, linear_to_db(maxf(mv, 0.0001)))
	AudioServer.set_bus_volume_db(_sfx_bus, linear_to_db(maxf(sv, 0.0001)))
	AudioServer.set_bus_mute(_music_bus, bool(SaveManager.get_value("settings", "music_muted", false)) or mv <= 0.001)
	AudioServer.set_bus_mute(_sfx_bus, bool(SaveManager.get_value("settings", "sfx_muted", false)) or sv <= 0.001)


func play(id: String, pitch := 1.0, volume_db := 0.0) -> void:
	var stream: AudioStream = _sfx.get(id)
	if stream == null:
		return
	for p in _pool:
		if not p.playing:
			p.stream = stream
			p.pitch_scale = pitch
			p.volume_db = volume_db
			p.play()
			return
	# All busy: steal the first voice.
	_pool[0].stream = stream
	_pool[0].pitch_scale = pitch
	_pool[0].play()


func play_music() -> void:
	if _music.stream != null and not _music.playing:
		_music.play()


func vibrate(ms := 18) -> void:
	if bool(SaveManager.get_value("settings", "vibration", true)) and OS.has_feature("mobile"):
		Input.vibrate_handheld(ms)


# --------------------------------------------------------------------------
# Placeholder synthesis
# --------------------------------------------------------------------------
func _load_override(base_path: String) -> AudioStream:
	for ext in [".ogg", ".wav", ".mp3"]:
		if ResourceLoader.exists(base_path + ext):
			return load(base_path + ext)
	return null


func _build_sfx() -> void:
	var recipes := {
		# id: [notes(Hz), duration, wave, attack, sweep(Hz/s), noise]
		"select": [[880.0, 1320.0], 0.09, "sine", 0.005, 0.0, 0.0],
		"deselect": [[660.0], 0.07, "sine", 0.005, -800.0, 0.0],
		"move": [[420.0], 0.12, "sine", 0.01, 900.0, 0.0],
		"pour": [[300.0], 0.42, "bubble", 0.03, 0.0, 0.35],
		"land": [[520.0, 780.0], 0.16, "sine", 0.004, -400.0, 0.08],
		"complete": [[784.0, 988.0, 1175.0], 0.55, "bell", 0.004, 0.0, 0.0],
		"click": [[1200.0], 0.045, "sine", 0.002, -2000.0, 0.0],
		"level_complete": [[523.0, 659.0, 784.0, 1047.0], 1.3, "arp", 0.01, 0.0, 0.0],
		"coin": [[1568.0, 2093.0], 0.22, "arp", 0.002, 0.0, 0.0],
		"error": [[180.0, 150.0], 0.2, "square", 0.004, -60.0, 0.0],
		"hint": [[988.0, 1319.0, 1760.0], 0.45, "arp", 0.006, 0.0, 0.0],
		"unlock": [[659.0, 880.0, 1109.0, 1319.0], 0.8, "arp", 0.005, 0.0, 0.0],
	}
	for id in recipes:
		var override := _load_override(SFX_DIR + id)
		if override:
			_sfx[id] = override
			continue
		var r: Array = recipes[id]
		_sfx[id] = _synth(r[0], r[1], r[2], r[3], r[4], r[5])


func _synth(notes: Array, duration: float, wave: String, attack: float, sweep: float,
		noise: float) -> AudioStreamWAV:
	var n := int(duration * MIX_RATE)
	var bytes := PackedByteArray()
	bytes.resize(n * 2)
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(wave) + n
	var phase := 0.0
	var bubble_phase := 0.0
	for i in range(n):
		var t := float(i) / MIX_RATE
		var env := minf(1.0, t / maxf(attack, 0.0001)) * pow(1.0 - float(i) / n, 2.0)
		var v := 0.0
		match wave:
			"arp":
				var idx := mini(int(t / duration * notes.size() * 1.6), notes.size() - 1)
				var f: float = notes[idx]
				v = sin(TAU * f * t) * 0.6 + sin(TAU * f * 2.0 * t) * 0.15
			"bell":
				for k in range(notes.size()):
					var fb: float = notes[k]
					v += sin(TAU * fb * t) * exp(-t * (3.0 + k)) * 0.45
			"square":
				var fs: float = notes[0] if t < duration * 0.5 else notes[notes.size() - 1]
				v = (1.0 if sin(TAU * fs * t) > 0.0 else -1.0) * 0.25
			"bubble":
				# Gurgling: a wobbling sine plus filtered noise.
				var base: float = notes[0]
				bubble_phase += TAU * (base + sin(t * 38.0) * 120.0 + sin(t * 11.0) * 60.0) / MIX_RATE
				v = sin(bubble_phase) * 0.35
			_:
				var fq: float = notes[0] + sweep * t
				if notes.size() > 1 and t > duration * 0.4:
					fq = notes[1] + sweep * t
				phase += TAU * fq / MIX_RATE
				v = sin(phase) * 0.6
		if noise > 0.0:
			v += rng.randf_range(-1.0, 1.0) * noise * 0.4
		var s := int(clampf(v * env, -1.0, 1.0) * 30000.0)
		bytes.encode_s16(i * 2, s)
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = MIX_RATE
	wav.stereo = false
	wav.data = bytes
	return wav


func _build_music_threaded() -> void:
	var stream: AudioStream = _load_override(MUSIC_PATH)
	if stream == null:
		stream = _synth_ambient()
	elif stream is AudioStreamOggVorbis:
		(stream as AudioStreamOggVorbis).loop = true
	elif stream is AudioStreamMP3:
		(stream as AudioStreamMP3).loop = true
	call_deferred("_on_music_ready", stream)


func _exit_tree() -> void:
	# Never quit while the synthesis thread is still running.
	if _music_task >= 0:
		WorkerThreadPool.wait_for_task_completion(_music_task)
		_music_task = -1
	for p in _pool:
		p.stop()
		p.stream = null
	_music.stop()
	_music.stream = null
	_sfx.clear()


func _on_music_ready(stream: AudioStream) -> void:
	if _music_task >= 0:
		WorkerThreadPool.wait_for_task_completion(_music_task)
		_music_task = -1
	_music.stream = stream
	_music.play()


## Soft looping pad: four slow chords with a gentle shimmer.
func _synth_ambient() -> AudioStreamWAV:
	var rate := 16000
	var chord_len := 4.0
	var chords := [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63],
		[196.0, 246.94, 293.66], [164.81, 207.65, 246.94]]
	var total := int(chord_len * chords.size() * rate)
	var bytes := PackedByteArray()
	bytes.resize(total * 2)
	for i in range(total):
		var t := float(i) / rate
		var ci := int(t / chord_len) % chords.size()
		var local := fmod(t, chord_len)
		var fade := minf(1.0, local / 1.2) * minf(1.0, (chord_len - local) / 1.2)
		var chord: Array = chords[ci]
		var v := 0.0
		for f in chord:
			var ff: float = f
			v += sin(TAU * ff * t) * 0.16 + sin(TAU * ff * 2.0 * t + 0.5) * 0.03
		v *= 0.35 + 0.65 * fade
		v += sin(TAU * 880.0 * t) * 0.012 * (0.5 + 0.5 * sin(t * 1.7))
		bytes.encode_s16(i * 2, int(clampf(v * 0.6, -1.0, 1.0) * 30000.0))
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = rate
	wav.stereo = false
	wav.data = bytes
	wav.loop_mode = AudioStreamWAV.LOOP_FORWARD
	wav.loop_begin = 0
	wav.loop_end = total
	return wav
