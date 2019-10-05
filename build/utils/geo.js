export var CoordinateSystem;
(function (CoordinateSystem) {
    CoordinateSystem[CoordinateSystem["WGS84"] = 4326] = "WGS84";
})(CoordinateSystem || (CoordinateSystem = {}));
export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({
                coordinateSystem: CoordinateSystem.WGS84,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        }, reject);
    });
}
//# sourceMappingURL=geo.js.map