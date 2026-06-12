package models

// GeoIPRecord represents the GeoLite2 Country result from MMDB lookup.
// The struct tags correspond to the keys in the MMDB file.
type GeoIPRecord struct {
	Country struct {
		GeonameID int `maxminddb:"geoname_id"`
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

// LookupResult is the API response for an IP lookup.
type LookupResult struct {
	IP          string `json:"ip"`
	Found       bool   `json:"found"`
	Country     string `json:"country,omitempty"`
	CountryISO  string `json:"country_iso,omitempty"`
	GeonameID   int    `json:"geoname_id,omitempty"`
	Continent   string `json:"continent,omitempty"`
	Network     string `json:"network,omitempty"`
}

// GeoIPUpdate represents a single update record for tracking.
type GeoIPUpdate struct {
	ID        int    `json:"id"`
	Tag       string `json:"tag"`
	Status    string `json:"status"`
	Filesize  int64  `json:"filesize,omitempty"`
	CreatedAt string `json:"created_at"`
}

// Stats represents database/service statistics.
type Stats struct {
	DBBlocks  int `json:"db_blocks"`
	Countries int `json:"countries"`
	MMDBLoaded bool `json:"mmdb_loaded"`
}