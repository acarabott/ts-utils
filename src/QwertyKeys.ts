const keyMap = {
    notes: {
        KeyA: 0,
        KeyW: 1,
        KeyS: 2,
        KeyE: 3,
        KeyD: 4,
        KeyF: 5,
        KeyT: 6,
        KeyG: 7,
        KeyY: 8,
        KeyH: 9,
        KeyU: 10,
        KeyJ: 11,
        KeyK: 12,
        KeyO: 13,
        KeyL: 14,
        KeyP: 15,
        Semicolon: 16,
    },
    params: {
        Comma: "Octave Down",
        Period: "Octave Up",
        KeyN: "Velocity Down",
        KeyM: "Velocity Up",
    },
} as const;

export class QwertyKeys {
    public onNoteDown: (note: number, velocity: number) => void;
    public onNoteUp: (note: number, velocity: number) => void;

    private el: HTMLElement;
    private _octave: number;
    private _velocity: number;

    private onKeyDown: (event: KeyboardEvent) => void;
    private onKeyUp: (event: KeyboardEvent) => void;

    constructor(el: HTMLElement) {
        this.el = el;

        this._octave = 5;
        this._velocity = 100;

        this.onNoteDown = () => undefined;
        this.onNoteUp = () => undefined;

        this.onKeyDown = (event: KeyboardEvent) => {
            // note events
            if (event.code in keyMap.notes) {
                if (event.repeat) {
                    return;
                }

                const note = this.getNote(event);
                if (note !== undefined) {
                    this.onNoteDown(note, this.velocity);
                }
            }
            // param events
            else if (event.code in keyMap.params) {
                const param = keyMap.params[event.code as keyof typeof keyMap.params];
                switch (param) {
                    case "Octave Down":
                        this.octave = this.octave - 1;
                        break;

                    case "Octave Up":
                        this.octave = this.octave + 1;
                        break;

                    case "Velocity Down":
                        this.velocity = this.velocity - 5;
                        break;

                    case "Velocity Up":
                        this.velocity = this.velocity + 5;
                        break;

                    default:
                        break;
                }
            }
        };

        this.onKeyUp = (event: KeyboardEvent) => {
            const note = this.getNote(event);
            if (note !== undefined) {
                this.onNoteUp(note, this.velocity);
            }
        };

        this.el.addEventListener("keydown", this.onKeyDown);
        this.el.addEventListener("keyup", this.onKeyUp);
    }

    public get octave(): number {
        return this._octave;
    }
    public set octave(octave: number) {
        this._octave = Math.max(0, Math.min(octave, 10));
    }

    public get velocity(): number {
        return this._velocity;
    }
    public set velocity(velocity: number) {
        this._velocity = Math.max(0, Math.min(velocity, 127));
    }

    public remove() {
        this.el.removeEventListener("keydown", this.onKeyDown);
        this.el.removeEventListener("keyup", this.onKeyUp);
    }

    private getNote(event: KeyboardEvent) {
        const code = event.code as keyof typeof keyMap.notes;
        const interval = keyMap.notes[code];
        return interval === undefined ? undefined : this.octave * 12 + interval;
    }
}
