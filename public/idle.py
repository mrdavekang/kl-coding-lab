"""The preparation workspace's interactive shell, isolated from lesson checks."""
import code as _idle_code
import json as _idle_json
import linecache as _idle_linecache
import traceback as _idle_traceback
import builtins as _idle_builtins

_idle_console = None


def __kl_idle_reset():
    global _idle_console
    _idle_console = _idle_code.InteractiveConsole({"__name__": "__main__"}, filename="<pyshell>")


def __kl_idle_run(source):
    # Like IDLE's Run Module, each run starts again; the shell can then inspect it.
    __kl_idle_reset()
    _idle_linecache.cache["main.py"] = (len(source), None, source.splitlines(keepends=True), "main.py")
    exec(compile(source, "main.py", "exec"), _idle_console.locals)


def __kl_idle_execute(source, input_prompt=None):
    original_input = _idle_builtins.input
    try:
        if input_prompt is not None:
            def read_input(prompt="", /):
                # Keep input questions visible in the Shell, separate from saved results.
                input_prompt(str(prompt))
                return original_input()
            _idle_builtins.input = read_input
        __kl_idle_run(source)
        return _idle_json.dumps({"error": None})
    except BaseException as error:
        # Show the pupil's traceback, without the browser runner's internal frames.
        trace = error.__traceback__
        while trace and trace.tb_frame.f_code.co_name in ("__kl_idle_execute", "__kl_idle_run"):
            trace = trace.tb_next
        message = "".join(_idle_traceback.format_exception(type(error), error, trace))
        return _idle_json.dumps({"error": message, "stopped": isinstance(error, KeyboardInterrupt)})
    finally:
        _idle_builtins.input = original_input


def __kl_idle_push(source):
    if _idle_console is None:
        __kl_idle_reset()
    # The editor supplies indentation; Enter on that otherwise empty line ends a block.
    if not source.strip():
        source = ""
    return _idle_console.push(source)
