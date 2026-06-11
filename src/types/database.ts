// Tipos de la base de datos (Supabase / PostgreSQL).
// Generar/actualizar con: supabase gen types typescript --linked > src/types/database.ts
// Esta versión está escrita a mano para reflejar supabase/migrations/*.sql

export type EstatusOrden =
  | "recepcion"
  | "cotizando"
  | "esperando_piezas"
  | "en_reparacion"
  | "listo"
  | "entregado";

export type RolUsuario = "admin" | "mecanico";
export type EstatusAprobacion = "pendiente" | "aprobada" | "rechazada";
export type EstatusFactura = "pendiente" | "timbrada" | "cancelada" | "error";
export type DireccionMensaje = "inbound" | "outbound";

export interface Database {
  public: {
    Views: {
      [_ in never]: never;
    };
    Tables: {
      talleres: {
        Row: {
          id: string;
          nombre: string;
          rfc: string | null;
          regimen_fiscal: string | null;
          telefono_whatsapp: string;
          codigo_postal: string | null;
          configuracion_ia: Record<string, unknown>;
          aviso_privacidad_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["talleres"]["Row"]> & {
          nombre: string;
          telefono_whatsapp: string;
        };
        Update: Partial<Database["public"]["Tables"]["talleres"]["Row"]>;
        Relationships: [];
      };
      perfiles: {
        Row: {
          id: string;
          taller_id: string | null;
          nombre: string | null;
          rol: RolUsuario;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["perfiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfiles"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "perfiles_taller_id_fkey";
            columns: ["taller_id"];
            isOneToOne: false;
            referencedRelation: "talleres";
            referencedColumns: ["id"];
          },
        ];
      };
      clientes: {
        Row: {
          id: string;
          taller_id: string;
          nombre: string | null;
          telefono_enc: string;
          telefono_hash: string;
          email: string | null;
          rfc_facturacion: string | null;
          regimen_fiscal_receptor: string | null;
          codigo_postal: string | null;
          uso_cfdi: string;
          acepto_aviso_privacidad: boolean;
          aviso_privacidad_fecha: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["clientes"]["Row"]> & {
          taller_id: string;
          telefono_enc: string;
          telefono_hash: string;
        };
        Update: Partial<Database["public"]["Tables"]["clientes"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "clientes_taller_id_fkey";
            columns: ["taller_id"];
            isOneToOne: false;
            referencedRelation: "talleres";
            referencedColumns: ["id"];
          },
        ];
      };
      vehiculos: {
        Row: {
          id: string;
          taller_id: string;
          cliente_id: string;
          marca: string | null;
          modelo: string | null;
          anio: number | null;
          vin: string | null;
          placas_enc: string | null;
          kilometraje: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["vehiculos"]["Row"]> & {
          taller_id: string;
          cliente_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehiculos"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "vehiculos_taller_id_fkey";
            columns: ["taller_id"];
            isOneToOne: false;
            referencedRelation: "talleres";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehiculos_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
        ];
      };
      ordenes_trabajo: {
        Row: {
          id: string;
          taller_id: string;
          vehiculo_id: string;
          cliente_id: string;
          estatus: EstatusOrden;
          descripcion_cliente: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ordenes_trabajo"]["Row"]> & {
          taller_id: string;
          vehiculo_id: string;
          cliente_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["ordenes_trabajo"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "ordenes_trabajo_taller_id_fkey";
            columns: ["taller_id"];
            isOneToOne: false;
            referencedRelation: "talleres";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ordenes_trabajo_vehiculo_id_fkey";
            columns: ["vehiculo_id"];
            isOneToOne: false;
            referencedRelation: "vehiculos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ordenes_trabajo_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
        ];
      };
      diagnosticos_ia: {
        Row: {
          id: string;
          orden_id: string;
          transcripcion_audio: string | null;
          analisis_rag: string | null;
          sugerencia_piezas: unknown[];
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["diagnosticos_ia"]["Row"]> & {
          orden_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["diagnosticos_ia"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "diagnosticos_ia_orden_id_fkey";
            columns: ["orden_id"];
            isOneToOne: false;
            referencedRelation: "ordenes_trabajo";
            referencedColumns: ["id"];
          },
        ];
      };
      cotizaciones: {
        Row: {
          id: string;
          orden_id: string;
          mano_obra: number;
          refacciones: { nombre: string; precio: number; cantidad: number; disponibilidad?: string }[];
          subtotal: number;
          iva: number;
          total: number;
          estatus_aprobacion: EstatusAprobacion;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cotizaciones"]["Row"]> & {
          orden_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["cotizaciones"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "cotizaciones_orden_id_fkey";
            columns: ["orden_id"];
            isOneToOne: false;
            referencedRelation: "ordenes_trabajo";
            referencedColumns: ["id"];
          },
        ];
      };
      manuales_embeddings: {
        Row: {
          id: string;
          taller_id: string | null;
          marca: string | null;
          modelo: string | null;
          fuente: string | null;
          contenido_texto: string;
          embedding: number[] | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["manuales_embeddings"]["Row"]> & {
          contenido_texto: string;
        };
        Update: Partial<Database["public"]["Tables"]["manuales_embeddings"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "manuales_embeddings_taller_id_fkey";
            columns: ["taller_id"];
            isOneToOne: false;
            referencedRelation: "talleres";
            referencedColumns: ["id"];
          },
        ];
      };
      whatsapp_mensajes: {
        Row: {
          id: string;
          taller_id: string;
          cliente_id: string | null;
          orden_id: string | null;
          direction: DireccionMensaje;
          body: string | null;
          media_url: string | null;
          twilio_sid: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["whatsapp_mensajes"]["Row"]> & {
          taller_id: string;
          direction: DireccionMensaje;
        };
        Update: Partial<Database["public"]["Tables"]["whatsapp_mensajes"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "whatsapp_mensajes_taller_id_fkey";
            columns: ["taller_id"];
            isOneToOne: false;
            referencedRelation: "talleres";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "whatsapp_mensajes_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "whatsapp_mensajes_orden_id_fkey";
            columns: ["orden_id"];
            isOneToOne: false;
            referencedRelation: "ordenes_trabajo";
            referencedColumns: ["id"];
          },
        ];
      };
      facturas: {
        Row: {
          id: string;
          orden_id: string;
          facturama_id: string | null;
          uuid_fiscal: string | null;
          serie: string | null;
          folio: string | null;
          clave_producto_servicio: string;
          clave_unidad: string;
          unidad: string;
          total: number | null;
          xml_url: string | null;
          pdf_url: string | null;
          estatus: EstatusFactura;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["facturas"]["Row"]> & {
          orden_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["facturas"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "facturas_orden_id_fkey";
            columns: ["orden_id"];
            isOneToOne: false;
            referencedRelation: "ordenes_trabajo";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      match_manuales: {
        Args: {
          query_embedding: number[];
          match_taller_id: string;
          match_count?: number;
          filtro_marca?: string | null;
          filtro_modelo?: string | null;
        };
        Returns: {
          id: string;
          marca: string | null;
          modelo: string | null;
          fuente: string | null;
          contenido_texto: string;
          similarity: number;
        }[];
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
