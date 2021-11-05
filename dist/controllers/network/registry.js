"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkRegistry = exports.getGiverSummary = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const core_1 = require("../../core");
const giver_1 = require("./giver");
const core_2 = require("@tonclient/core");
const known_contracts_1 = require("../../core/known-contracts");
const utils_1 = require("../../core/utils");
function networkHome() {
    return path_1.default.resolve((0, core_1.tondevHome)(), "network");
}
function registryPath() {
    return path_1.default.resolve(networkHome(), "registry.json");
}
function getGiverSummary(giver) {
    if (!giver) {
        return "";
    }
    const { signer, name, address, } = giver;
    return `${address}\n${name}${signer ? ` signed by ${signer}` : ""}`;
}
exports.getGiverSummary = getGiverSummary;
class NetworkRegistry {
    constructor() {
        var _a;
        this.items = [];
        let loaded = false;
        if (fs_extra_1.default.pathExistsSync(registryPath())) {
            try {
                const data = JSON.parse(fs_extra_1.default.readFileSync(registryPath(), "utf8"));
                this.items = (_a = data.items) !== null && _a !== void 0 ? _a : [];
                if (data.default) {
                    this.default = data.default;
                }
                loaded = true;
            }
            catch {
            }
        }
        if (!loaded) {
            this.items = [{
                    name: "se",
                    endpoints: ["http://localhost"],
                    giver: {
                        name: known_contracts_1.KnownContracts.GiverV2.name,
                        address: "0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5",
                        signer: "",
                    },
                }, {
                    name: "dev",
                    endpoints: [
                        "net.ton.dev", "net1.ton.dev", "net5.ton.dev",
                    ],
                }, {
                    name: "main",
                    endpoints: ["main.ton.dev", "main2.ton.dev", "main3.ton.dev", "main4.ton.dev"],
                }];
            this.default = "dev";
        }
    }
    save() {
        if (!fs_extra_1.default.pathExistsSync(networkHome())) {
            fs_extra_1.default.mkdirSync(networkHome(), { recursive: true });
        }
        (0, utils_1.writeJsonFile)(registryPath(), {
            items: this.items,
            default: this.default,
        });
    }
    add(name, description, endpoints, overwrite) {
        name = name.trim();
        const existingIndex = this.items.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
        if (existingIndex >= 0 && !overwrite) {
            throw new Error(`Net "${name}" already exists.`);
        }
        const network = {
            name,
            description,
            endpoints,
        };
        if (existingIndex >= 0) {
            this.items[existingIndex] = network;
        }
        else {
            this.items.push(network);
        }
        if (!this.default) {
            this.default = name;
        }
        this.save();
    }
    get(name) {
        var _a;
        let findName = name.toLowerCase().trim();
        if (findName === "") {
            findName = (_a = this.default) !== null && _a !== void 0 ? _a : "";
        }
        if (findName === "") {
            if (this.items.length === 0) {
                throw new Error("There are no networks defined. " +
                    "Use \"tondev network add\" command to register a network.");
            }
            else {
                throw new Error("There is no default network. " +
                    "Use \"tondev network default\" command to set the default network. " +
                    "Or explicitly specify the network with \"--network\" option.");
            }
        }
        const network = this.items.find(x => x.name.toLowerCase() === findName);
        if (network) {
            return network;
        }
        throw new Error(`Network not found: ${name}`);
    }
    delete(name) {
        const net = this.get(name);
        this.items.splice(this.items.findIndex(x => x.name === net.name), 1);
        if (this.default === net.name) {
            delete this.default;
        }
        this.save();
    }
    setDefault(name) {
        this.default = this.get(name).name;
        this.save();
    }
    async setGiver(name, address, signer, value) {
        const network = this.get(name);
        const client = new core_2.TonClient({ network: { endpoints: network.endpoints } });
        try {
            const giver = await giver_1.NetworkGiver.create(client, {
                name: "",
                address,
                signer,
                value,
            });
            network.giver = {
                name: giver.contract.name,
                address: giver.address,
                signer,
                value,
            };
            this.save();
        }
        finally {
            await client.close();
        }
    }
    static getEndpointsSummary(network) {
        const maxEndpoints = 3;
        const endpoints = network.endpoints.length <= maxEndpoints
            ? network.endpoints
            : [...network.endpoints.slice(0, maxEndpoints), "..."];
        return endpoints.join(", ");
    }
    getNetworkSummary(network) {
        var _a;
        return {
            name: `${network.name}${network.name === this.default ? " (Default)" : ""}`,
            endpoints: NetworkRegistry.getEndpointsSummary(network),
            giver: getGiverSummary(network.giver),
            description: (_a = network.description) !== null && _a !== void 0 ? _a : "",
        };
    }
}
exports.NetworkRegistry = NetworkRegistry;
//# sourceMappingURL=registry.js.map