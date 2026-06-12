package models

type GeoIPRecord struct {
	Country struct {
		GeonameID int    `maxminddb:"geoname_id"`
		ISOCode   string `maxminddb:"iso_code"`
		Names     struct {
			En string `maxminddb:"en"`
		} `maxminddb:"names"`
	} `maxminddb:"country"`
	Continent struct {
		GeonameID int    `maxminddb:"geoname_id"`
		Code      string `maxminddb:"code"`
	} `maxminddb:"continent"`
	RegisteredCountry struct {
		GeonameID int `maxminddb:"geoname_id"`
	} `maxminddb:"registered_country"`
}

type LookupResult struct {
	IP         string `json:"ip"`
	Found      bool   `json:"found"`
	Country    string `json:"country,omitempty"`
	CountryISO string `json:"country_iso,omitempty"`
	GeonameID  int    `json:"geoname_id,omitempty"`
	Continent  string `json:"continent,omitempty"`
	Network    string `json:"network,omitempty"`
}

type GeoIPUpdate struct {
	ID        int    `json:"id"`
	Tag       string `json:"tag"`
	Status    string `json:"status"`
	Filesize  int64  `json:"filesize,omitempty"`
	CreatedAt string `json:"created_at"`
}

type Stats struct {
	DBBlocks   int  `json:"db_blocks"`
	Countries  int  `json:"countries"`
	MMDBLoaded bool `json:"mmdb_loaded"`
}