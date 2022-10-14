"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.findControllerAndCommandByAlias = exports.controllers = void 0;
const clang_1 = require("./clang");
const solidity_1 = require("./solidity");
// import {TestSuite} from "./ts";
const js_1 = require("./js");
const se_1 = require("./se");
const tonos_cli_1 = require("./tonos-cli");
const ts4_1 = require("./ts4");
const debrowser_1 = require("./debrowser");
const core_1 = require("../core");
const signer_1 = require("./signer");
const network_1 = require("./network");
const contract_1 = require("./contract");
const cli_1 = require("../cli");
exports.controllers = [
    clang_1.Clang,
    solidity_1.Solidity,
    se_1.SE,
    network_1.NetworkTool,
    signer_1.SignerTool,
    contract_1.Contract,
    js_1.JsApps,
    tonos_cli_1.TONOS,
    ts4_1.TestSuite4,
    debrowser_1.DeBrowser,
];
function findControllerAndCommandByAlias(alias) {
    alias = alias.trim().toLowerCase();
    for (const controller of exports.controllers) {
        for (const command of controller.commands) {
            if (controller.alias && command.alias) {
                if (`${controller.alias}${command.alias}` === alias) {
                    return {
                        controller,
                        command,
                    };
                }
            }
        }
    }
    return undefined;
}
exports.findControllerAndCommandByAlias = findControllerAndCommandByAlias;
function runCommand(terminal, name, args) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const [controllerName, commandName] = name
            .toLowerCase()
            .split(" ")
            .map(x => x.trim())
            .filter(x => x !== "");
        const controller = exports.controllers.find(x => (0, core_1.matchName)(x, controllerName));
        if (!controller) {
            throw new Error(`Controller ${controllerName} not found`);
        }
        const command = controller.commands.find(x => (0, core_1.matchName)(x, commandName));
        if (!command) {
            throw new Error(`Command ${commandName} not found in controller ${controllerName}`);
        }
        const resolvedArgs = Object.assign({}, args);
        let checkedArgs = Object.keys(resolvedArgs);
        for (const arg of (_a = command.args) !== null && _a !== void 0 ? _a : []) {
            const name = arg.name
                .split("-")
                .map((x, i) => i > 0 ? x.substr(0, 1).toUpperCase() + x.substr(1) : x)
                .join("");
            if (resolvedArgs[name] === undefined) {
                if (arg.defaultValue !== undefined) {
                    resolvedArgs[name] =
                        arg.type === "boolean"
                            ? arg.defaultValue === "true"
                            : arg.defaultValue;
                }
                else if (arg.type === "folder") {
                    resolvedArgs[name] = process.cwd();
                }
                else {
                    throw yield (0, cli_1.missingArgError)(arg);
                }
            }
            else {
                // remove matched element from array
                checkedArgs = checkedArgs.filter(k => k !== name);
            }
        }
        if (checkedArgs.length > 0) {
            const msg = [`Unknow option: ${checkedArgs[0]}`];
            if (checkedArgs[0].includes("-")) {
                msg.push(`You must convert parameters to camelcase, for example "output-dir" to "outputDir"`);
            }
            throw Error(msg.join("\n"));
        }
        yield command.run(terminal, resolvedArgs);
    });
}
exports.runCommand = runCommand;
//# sourceMappingURL=index.js.map